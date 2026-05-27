import { badRequest, forbidden } from '../../../common/shared-kernel/errors';
import {
  createDealCustomField,
  createFunnelStage,
  deactivateDealCustomField,
  deactivateFunnelStage,
  findDealCustomFields,
  findDealCustomFieldValues,
  findFunnelStage,
  findFunnelStages,
  updateDealCustomField,
  updateDealCustomFieldOrder,
  updateFunnelStage,
  updateFunnelStageOrder,
  upsertDealCustomFieldValue,
} from '../repositories/pipeline-settings.repository';

export async function listFunnelStages(funnelId?: string) {
  return findFunnelStages(funnelId);
}

export const addFunnelStage = createFunnelStage;

export async function changeFunnelStages(input: Record<string, unknown>) {
  if (Array.isArray(input.stages)) {
    await updateFunnelStageOrder(input.stages as { id: string; order: number }[]);
    return { ok: true };
  }
  const { id, ...data } = input;
  return updateFunnelStage(String(id), data);
}

export async function removeFunnelStage(idInput: unknown) {
  const id = String(idInput ?? '');
  if (!id) throw badRequest('id required');
  const stage = await findFunnelStage(id);
  if (!stage) throw badRequest('Not found');
  if (['new_lead', 'closed', 'cancelled', 'rejected'].includes(stage.value)) {
    throw forbidden('Cannot delete system stage');
  }
  await deactivateFunnelStage(id);
  return { ok: true };
}

export const listDealCustomFields = findDealCustomFields;
export const addDealCustomField = createDealCustomField;

export async function changeDealCustomFields(input: Record<string, unknown>) {
  if (Array.isArray(input.items)) {
    await updateDealCustomFieldOrder(input.items as { id: string; order: number }[]);
    return { ok: true };
  }
  const { id, ...data } = input;
  return updateDealCustomField(String(id), data);
}

export async function removeDealCustomField(idInput: unknown) {
  const id = String(idInput ?? '');
  if (!id) throw badRequest('id required');
  await deactivateDealCustomField(id);
  return { ok: true };
}

export async function listDealCustomFieldValues(dealIdInput: unknown) {
  const dealId = String(dealIdInput ?? '');
  if (!dealId) throw badRequest('dealId required');
  return findDealCustomFieldValues(dealId);
}

export async function saveDealCustomFieldValue(input: Record<string, unknown>) {
  return upsertDealCustomFieldValue(String(input.dealId), String(input.fieldId), String(input.value));
}

