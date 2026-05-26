"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listLeadDistributionRules = listLeadDistributionRules;
exports.addLeadDistributionRule = addLeadDistributionRule;
exports.changeLeadDistributionRule = changeLeadDistributionRule;
exports.removeLeadDistributionRule = removeLeadDistributionRule;
const errors_1 = require("../../../common/shared-kernel/errors");
const lead_distribution_repository_1 = require("../repositories/lead-distribution.repository");
async function listLeadDistributionRules(activeOnly = false) {
    return (0, lead_distribution_repository_1.findLeadDistributionRules)(activeOnly);
}
async function addLeadDistributionRule(input) {
    return (0, lead_distribution_repository_1.createLeadDistributionRule)(input);
}
async function changeLeadDistributionRule(input) {
    if (Array.isArray(input.items)) {
        await (0, lead_distribution_repository_1.updateLeadDistributionPriorities)(input.items);
        return { ok: true };
    }
    const id = String(input.id ?? '').trim();
    if (!id)
        throw (0, errors_1.badRequest)('id required');
    const { id: _id, ...data } = input;
    return (0, lead_distribution_repository_1.updateLeadDistributionRule)(id, data);
}
async function removeLeadDistributionRule(idInput) {
    const id = String(idInput ?? '').trim();
    if (!id)
        throw (0, errors_1.badRequest)('id required');
    await (0, lead_distribution_repository_1.deleteLeadDistributionRule)(id);
    return { ok: true };
}
