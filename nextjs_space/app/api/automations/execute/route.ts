export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logActivity } from '@/lib/activity-logger';

/**
 * Automation execution endpoint — called by the scheduler daemon.
 * Checks active automations against current data and executes actions.
 */
export async function POST(req: Request) {
  try {
    // Verify internal secret (daemon passes it)
    const body = await req.json().catch(() => ({}));
    const secret = body.secret || '';
    if (secret !== (process.env.AUTOMATION_SECRET || 'auto_run_secret_2024')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const automations = await prisma.automation.findMany({ where: { isActive: true } });
    const results: string[] = [];

    // ─── Action helpers (used across all triggers) ───
    async function execAction(
      auto: { action: string; actionValue: string | null },
      ctx: { leadId?: string | null; dealId?: string | null; assignedToId?: string | null; entityName?: string },
    ) {
      const { action: act, actionValue: val } = auto;
      const { leadId, dealId, assignedToId, entityName } = ctx;

      if (act === 'create_task') {
        await prisma.task.create({
          data: {
            title: val || `Задача: ${entityName ?? 'авто'}`,
            description: val || 'Автоматично створена задача',
            type: 'call',
            priority: 'high',
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
            assignedToId: assignedToId ?? null,
            leadId: leadId ?? null,
          },
        });
        return true;
      }

      if (act === 'send_message' && leadId) {
        await prisma.communication.create({
          data: {
            leadId,
            type: 'note',
            direction: 'outgoing',
            content: val || 'Автоматичне повідомлення',
            userId: assignedToId ?? null,
          },
        });
        return true;
      }

      if (act === 'assign_agent') {
        const targetUserId = val;
        if (!targetUserId) return false;
        if (leadId) {
          await prisma.lead.update({ where: { id: leadId }, data: { assignedToId: targetUserId } });
          return true;
        }
        if (dealId) {
          await prisma.deal.update({ where: { id: dealId }, data: { assignedToId: targetUserId } });
          return true;
        }
        return false;
      }

      if (act === 'change_status' && leadId) {
        const newStatus = val || 'contacted';
        await prisma.lead.update({ where: { id: leadId }, data: { status: newStatus } });
        return true;
      }

      if (act === 'notify') {
        await prisma.task.create({
          data: {
            title: `🔔 ${val || entityName || 'Сповіщення'}`,
            description: val || 'Автоматичне сповіщення від автоматизації',
            type: 'other',
            priority: 'high',
            status: 'pending',
            dueDate: new Date(Date.now() + 60 * 60 * 1000),
            assignedToId: assignedToId ?? null,
            leadId: leadId ?? null,
          },
        });
        return true;
      }

      return false;
    }

    for (const auto of automations) {
      try {
        let actionsExecuted = 0;

        // ─── Trigger: task_overdue ───
        if (auto.trigger === 'task_overdue') {
          const overdue = await prisma.task.findMany({
            where: { status: 'pending', dueDate: { lt: new Date() } },
            take: 20,
            include: { assignedTo: { select: { id: true } } },
          });
          for (const task of overdue) {
            const ok = await execAction(auto, {
              leadId: task.leadId,
              assignedToId: task.assignedTo?.id,
              entityName: task.title,
            });
            if (ok) actionsExecuted++;
          }
        }

        // ─── Trigger: no_response (3 days without update) ───
        if (auto.trigger === 'no_response') {
          const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
          const staleLeads = await prisma.lead.findMany({
            where: { status: { in: ['new', 'contacted'] }, updatedAt: { lt: threeDaysAgo } },
            take: 20,
          });
          for (const lead of staleLeads) {
            const ok = await execAction(auto, {
              leadId: lead.id,
              assignedToId: lead.assignedToId,
              entityName: `${lead.firstName} ${lead.lastName ?? ''}`,
            });
            if (ok) actionsExecuted++;
            await prisma.lead.update({ where: { id: lead.id }, data: { updatedAt: new Date() } });
          }
        }

        // ─── Trigger: new_lead ───
        if (auto.trigger === 'new_lead') {
          const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
          const lastRun = auto.lastRunAt ?? new Date(0);
          const newLeads = await prisma.lead.findMany({
            where: { createdAt: { gt: lastRun > oneHourAgo ? lastRun : oneHourAgo } },
            take: 20,
          });
          for (const lead of newLeads) {
            const ok = await execAction(auto, {
              leadId: lead.id,
              assignedToId: lead.assignedToId,
              entityName: `${lead.firstName} ${lead.lastName ?? ''}`,
            });
            if (ok) actionsExecuted++;
          }
        }

        // ─── Trigger: deal_closed ───
        if (auto.trigger === 'deal_closed') {
          const lastRun = auto.lastRunAt ?? new Date(0);
          const closedDeals = await prisma.deal.findMany({
            where: { stage: 'closed', updatedAt: { gt: lastRun } },
            take: 20,
            include: { lead: true },
          });
          for (const deal of closedDeals) {
            const ok = await execAction(auto, {
              leadId: deal.leadId,
              dealId: deal.id,
              assignedToId: deal.assignedToId,
              entityName: deal.title,
            });
            if (ok) actionsExecuted++;
          }
        }

        // ─── Trigger: stage_change ───
        if (auto.trigger === 'stage_change') {
          const lastRun = auto.lastRunAt ?? new Date(0);
          const targetStage = auto.triggerValue;
          if (targetStage) {
            const changedDeals = await prisma.deal.findMany({
              where: { stage: targetStage, updatedAt: { gt: lastRun } },
              take: 20,
              include: { lead: true },
            });
            for (const deal of changedDeals) {
              const ok = await execAction(auto, {
                leadId: deal.leadId,
                dealId: deal.id,
                assignedToId: deal.assignedToId,
                entityName: deal.title,
              });
              if (ok) actionsExecuted++;
            }
          }
        }

        // Update lastRunAt
        await prisma.automation.update({
          where: { id: auto.id },
          data: {
            lastRunAt: new Date(),
            lastRunResult: actionsExecuted > 0 ? `Виконано ${actionsExecuted} дій` : 'Нових дій не знайдено',
          },
        });

        if (actionsExecuted > 0) {
          results.push(`${auto.name}: ${actionsExecuted} дій`);
          logActivity({
            entityType: 'automation',
            entityId: auto.id,
            action: 'update',
            details: `Автоматизація "${auto.name}" виконала ${actionsExecuted} дій`,
          });
        }
      } catch (err: any) {
        results.push(`${auto.name}: ERROR - ${err.message}`);
        await prisma.automation.update({
          where: { id: auto.id },
          data: { lastRunAt: new Date(), lastRunResult: `Помилка: ${err.message}` },
        });
      }
    }

    return NextResponse.json({ ok: true, processed: automations.length, results });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Error' }, { status: 500 });
  }
}
