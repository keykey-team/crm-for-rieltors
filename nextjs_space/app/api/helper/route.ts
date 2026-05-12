export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getHelperLimit, getMonthStart } from '@/lib/helper-limits';
import fs from 'fs';
import path from 'path';

// Load knowledge base once
let knowledgeBase = '';
try {
  knowledgeBase = fs.readFileSync(
    path.join(process.cwd(), 'public', 'freemor-crm-guide.md'),
    'utf-8'
  );
} catch {
  knowledgeBase = 'FREEMO R CRM — CRM-система для рієлторів.';
}

const SYSTEM_PROMPT = `Ти — FREEMO R Хелпер, AI-асистент CRM-системи FREEMO R для рієлторів.
Відповідай коротко, чітко, українською мовою.
Використовуй знання з бази знань нижче, щоб допомогти користувачу.
Якщо не знаєш відповіді — чесно скажи про це.
Не вигадуй функції, яких немає в CRM.
Будь дружнім та професійним.

--- БАЗА ЗНАНЬ ---
${knowledgeBase}
--- КІНЕЦЬ БАЗИ ЗНАНЬ ---`;

// POST — send message (streaming)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });
    const plan = user?.plan ?? 'free';
    const limit = getHelperLimit(plan);
    const monthStart = getMonthStart();

    // Count user messages this month
    const usedCount = await prisma.helperMessage.count({
      where: {
        userId,
        role: 'user',
        createdAt: { gte: monthStart },
      },
    });

    if (usedCount >= limit) {
      return NextResponse.json(
        {
          error: 'limit_reached',
          used: usedCount,
          limit,
          plan,
        },
        { status: 429 }
      );
    }

    const { message, history } = await req.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    // Save user message to DB
    await prisma.helperMessage.create({
      data: { userId, role: 'user', content: message },
    });

    // Build messages for LLM — last 10 messages for context
    const recentHistory = Array.isArray(history) ? history.slice(-10) : [];
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...recentHistory.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
      { role: 'user', content: message },
    ];

    // Call LLM API with streaming
    const llmResponse = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-5.4-mini',
        messages,
        stream: true,
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!llmResponse.ok) {
      const errText = await llmResponse.text();
      console.error('LLM API error:', errText);
      return NextResponse.json({ error: 'LLM API error' }, { status: 502 });
    }

    // Stream response back to client
    let fullResponse = '';
    const stream = new ReadableStream({
      async start(controller) {
        const reader = llmResponse.body?.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();

        if (!reader) {
          controller.close();
          return;
        }

        let partialRead = '';
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            partialRead += decoder.decode(value, { stream: true });
            const lines = partialRead.split('\n');
            partialRead = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim();
                if (data === '[DONE]') continue;
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content || '';
                  if (content) {
                    fullResponse += content;
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                    );
                  }
                } catch {
                  // skip
                }
              }
            }
          }

          // Save assistant response to DB
          if (fullResponse) {
            await prisma.helperMessage.create({
              data: { userId, role: 'assistant', content: fullResponse },
            });
          }

          // Send usage info at the end
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                done: true,
                used: usedCount + 1,
                limit,
              })}\n\n`
            )
          );
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Helper API error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// GET — get usage stats
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, role: true },
    });
    const plan = user?.plan ?? 'free';
    const limit = getHelperLimit(plan);
    const monthStart = getMonthStart();

    const used = await prisma.helperMessage.count({
      where: {
        userId,
        role: 'user',
        createdAt: { gte: monthStart },
      },
    });

    // If admin, also return team stats
    let teamStats: any = null;
    if (user?.role === 'admin' || user?.role === 'director') {
      const allUsage = await prisma.helperMessage.groupBy({
        by: ['userId'],
        where: {
          role: 'user',
          createdAt: { gte: monthStart },
        },
        _count: { id: true },
      });

      const userIds = allUsage.map((u) => u.userId);
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true, plan: true },
      });

      teamStats = allUsage.map((u) => {
        const usr = users.find((x) => x.id === u.userId);
        return {
          userId: u.userId,
          name: usr?.name ?? usr?.email ?? '—',
          email: usr?.email ?? '',
          plan: usr?.plan ?? 'free',
          used: u._count.id,
          limit: getHelperLimit(usr?.plan ?? 'free'),
        };
      }).sort((a, b) => b.used - a.used);
    }

    // Get recent messages for chat history restore
    const recentMessages = await prisma.helperMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { role: true, content: true, createdAt: true },
    });

    return NextResponse.json({
      used,
      limit,
      plan,
      remaining: Math.max(0, limit - used),
      history: recentMessages.reverse(),
      teamStats,
    });
  } catch (error) {
    console.error('Helper stats error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
