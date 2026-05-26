import { createAutomation, deleteAutomation, findAutomations, updateAutomation } from '../repositories/automation.repository';

export async function listAutomations() {
  return findAutomations();
}

export async function addAutomation(userId: string | undefined, input: Record<string, unknown>) {
  return createAutomation({
    name: input.name,
    description: input.description ?? null,
    trigger: input.trigger,
    triggerValue: input.triggerValue ?? null,
    action: input.action,
    actionValue: input.actionValue ?? null,
    isActive: input.isActive ?? true,
    createdById: userId ?? null,
  });
}

export async function changeAutomation(id: string, input: Record<string, unknown>) {
  return updateAutomation(id, {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.trigger !== undefined ? { trigger: input.trigger } : {}),
    ...(input.triggerValue !== undefined ? { triggerValue: input.triggerValue } : {}),
    ...(input.action !== undefined ? { action: input.action } : {}),
    ...(input.actionValue !== undefined ? { actionValue: input.actionValue } : {}),
    ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
  });
}

export async function removeAutomation(id: string) {
  await deleteAutomation(id);
  return { success: true };
}

