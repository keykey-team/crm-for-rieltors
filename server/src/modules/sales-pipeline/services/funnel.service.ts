import { badRequest, forbidden } from '../../../common/shared-kernel/errors';
import {
  countFunnels,
  createFunnel,
  deactivateFunnel,
  findFunnel,
  findFunnels,
  updateFunnel,
} from '../repositories/funnel.repository';

const MAX_FUNNELS = 10;

export const listFunnels = findFunnels;

export async function addFunnel(input: Record<string, unknown>) {
  const name = String(input.name ?? '').trim();
  if (!name) throw badRequest('name required');
  if (name.length > 80) throw badRequest('name too long');

  const count = await countFunnels();
  if (count >= MAX_FUNNELS) throw badRequest(`Max ${MAX_FUNNELS} funnels allowed`);

  return createFunnel({ name });
}

export async function changeFunnel(input: Record<string, unknown>) {
  const id = String(input.id ?? '');
  if (!id) throw badRequest('id required');
  const name = String(input.name ?? '').trim();
  if (!name) throw badRequest('name required');
  return updateFunnel(id, { name });
}

export async function removeFunnel(idInput: unknown) {
  const id = String(idInput ?? '');
  if (!id) throw badRequest('id required');

  const funnel = await findFunnel(id);
  if (!funnel) throw badRequest('Not found');
  if (funnel.isDefault) throw forbidden('Cannot delete default funnel');

  await deactivateFunnel(id);
  return { ok: true };
}
