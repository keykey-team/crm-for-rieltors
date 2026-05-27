import { createTemplate, deleteTemplate, findTemplates, updateTemplate } from '../repositories/template.repository';

export async function listTemplates(type?: string) {
  return findTemplates(type);
}

export async function addTemplate(userId: string | undefined, input: Record<string, unknown>) {
  return createTemplate({
    name: input.name,
    type: input.type ?? 'message',
    category: input.category ?? 'general',
    content: input.content,
    variables: input.variables ?? null,
    createdById: userId ?? null,
  });
}

export async function changeTemplate(id: string, input: Record<string, unknown>) {
  return updateTemplate(id, {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.type !== undefined ? { type: input.type } : {}),
    ...(input.category !== undefined ? { category: input.category } : {}),
    ...(input.content !== undefined ? { content: input.content } : {}),
    ...(input.variables !== undefined ? { variables: input.variables } : {}),
  });
}

export async function removeTemplate(id: string) {
  await deleteTemplate(id);
  return { success: true };
}

