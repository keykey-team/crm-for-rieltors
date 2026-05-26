import { badRequest } from '../../../common/shared-kernel/errors';
import {
  createDictionary,
  deactivateDictionary,
  findActiveDictionaries,
  updateDictionary,
  updateDictionaryOrder,
} from '../repositories/dictionary.repository';

function getId(value: unknown): string {
  const id = String(value ?? '').trim();
  if (!id) throw badRequest('id required');
  return id;
}

export async function listDictionaries(category?: string) {
  return findActiveDictionaries(category);
}

export async function addDictionary(data: Record<string, unknown>) {
  return createDictionary(data);
}

export async function changeDictionary(input: Record<string, unknown>) {
  if (Array.isArray(input.items)) {
    await updateDictionaryOrder(input.items as { id: string; order: number }[]);
    return { ok: true };
  }

  const id = getId(input.id);
  const { id: _id, items: _items, ...data } = input;
  return updateDictionary(id, data);
}

export async function removeDictionary(idInput: unknown) {
  await deactivateDictionary(getId(idInput));
  return { ok: true };
}

