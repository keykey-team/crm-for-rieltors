import { badRequest } from '../../../common/shared-kernel/errors';
import {
  createAftercarePlan,
  deleteAftercarePlan,
  findAftercarePlans,
  replaceAftercareSteps,
  updateAftercarePlan,
  updateAftercarePlanOrder,
} from '../repositories/aftercare.repository';

export async function listAftercarePlans() {
  return findAftercarePlans();
}

export async function reorderAftercarePlans(input: Record<string, unknown>) {
  if (!Array.isArray(input.items)) throw badRequest('Invalid request');
  await updateAftercarePlanOrder(input.items as { id: string; order: number }[]);
  return { ok: true };
}

export async function addAftercarePlan(input: Record<string, unknown>) {
  const { steps, ...data } = input;
  return createAftercarePlan(data, steps);
}

export async function changeAftercarePlan(id: string, input: Record<string, unknown>) {
  const { steps, ...data } = input;
  if (Array.isArray(steps)) await replaceAftercareSteps(id, steps);
  return updateAftercarePlan(id, data);
}

export async function removeAftercarePlan(id: string) {
  await deleteAftercarePlan(id);
  return { ok: true };
}

