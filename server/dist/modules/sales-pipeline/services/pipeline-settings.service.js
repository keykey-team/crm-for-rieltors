"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDealCustomField = exports.listDealCustomFields = exports.addFunnelStage = exports.listFunnelStages = void 0;
exports.changeFunnelStages = changeFunnelStages;
exports.removeFunnelStage = removeFunnelStage;
exports.changeDealCustomFields = changeDealCustomFields;
exports.removeDealCustomField = removeDealCustomField;
exports.listDealCustomFieldValues = listDealCustomFieldValues;
exports.saveDealCustomFieldValue = saveDealCustomFieldValue;
const errors_1 = require("../../../common/shared-kernel/errors");
const pipeline_settings_repository_1 = require("../repositories/pipeline-settings.repository");
exports.listFunnelStages = pipeline_settings_repository_1.findFunnelStages;
exports.addFunnelStage = pipeline_settings_repository_1.createFunnelStage;
async function changeFunnelStages(input) {
    if (Array.isArray(input.stages)) {
        await (0, pipeline_settings_repository_1.updateFunnelStageOrder)(input.stages);
        return { ok: true };
    }
    const { id, ...data } = input;
    return (0, pipeline_settings_repository_1.updateFunnelStage)(String(id), data);
}
async function removeFunnelStage(idInput) {
    const id = String(idInput ?? '');
    if (!id)
        throw (0, errors_1.badRequest)('id required');
    const stage = await (0, pipeline_settings_repository_1.findFunnelStage)(id);
    if (!stage)
        throw (0, errors_1.badRequest)('Not found');
    if (['new_lead', 'closed', 'cancelled', 'rejected'].includes(stage.value)) {
        throw (0, errors_1.forbidden)('Cannot delete system stage');
    }
    await (0, pipeline_settings_repository_1.deactivateFunnelStage)(id);
    return { ok: true };
}
exports.listDealCustomFields = pipeline_settings_repository_1.findDealCustomFields;
exports.addDealCustomField = pipeline_settings_repository_1.createDealCustomField;
async function changeDealCustomFields(input) {
    if (Array.isArray(input.items)) {
        await (0, pipeline_settings_repository_1.updateDealCustomFieldOrder)(input.items);
        return { ok: true };
    }
    const { id, ...data } = input;
    return (0, pipeline_settings_repository_1.updateDealCustomField)(String(id), data);
}
async function removeDealCustomField(idInput) {
    const id = String(idInput ?? '');
    if (!id)
        throw (0, errors_1.badRequest)('id required');
    await (0, pipeline_settings_repository_1.deactivateDealCustomField)(id);
    return { ok: true };
}
async function listDealCustomFieldValues(dealIdInput) {
    const dealId = String(dealIdInput ?? '');
    if (!dealId)
        throw (0, errors_1.badRequest)('dealId required');
    return (0, pipeline_settings_repository_1.findDealCustomFieldValues)(dealId);
}
async function saveDealCustomFieldValue(input) {
    return (0, pipeline_settings_repository_1.upsertDealCustomFieldValue)(String(input.dealId), String(input.fieldId), String(input.value));
}
