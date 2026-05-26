import { badRequest } from '../../../common/shared-kernel/errors';
import {
  createLeadDistributionRule,
  deleteLeadDistributionRule,
  findLeadDistributionRules,
  updateLeadDistributionPriorities,
  updateLeadDistributionRule,
} from '../repositories/lead-distribution.repository';

export async function listLeadDistributionRules(activeOnly = false) {
  return findLeadDistributionRules(activeOnly);
}

export async function addLeadDistributionRule(input: Record<string, unknown>) {
  return createLeadDistributionRule(input);
}

export async function changeLeadDistributionRule(input: Record<string, unknown>) {
  if (Array.isArray(input.items)) {
    await updateLeadDistributionPriorities(input.items as { id: string; priority: number }[]);
    return { ok: true };
  }

  const id = String(input.id ?? '').trim();
  if (!id) throw badRequest('id required');
  const { id: _id, ...data } = input;
  return updateLeadDistributionRule(id, data);
}

export async function removeLeadDistributionRule(idInput: unknown) {
  const id = String(idInput ?? '').trim();
  if (!id) throw badRequest('id required');
  await deleteLeadDistributionRule(id);
  return { ok: true };
}

