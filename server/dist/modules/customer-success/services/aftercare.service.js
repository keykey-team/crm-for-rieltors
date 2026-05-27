"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAftercarePlans = listAftercarePlans;
exports.reorderAftercarePlans = reorderAftercarePlans;
exports.addAftercarePlan = addAftercarePlan;
exports.changeAftercarePlan = changeAftercarePlan;
exports.removeAftercarePlan = removeAftercarePlan;
const errors_1 = require("../../../common/shared-kernel/errors");
const aftercare_repository_1 = require("../repositories/aftercare.repository");
async function listAftercarePlans() {
    return (0, aftercare_repository_1.findAftercarePlans)();
}
async function reorderAftercarePlans(input) {
    if (!Array.isArray(input.items))
        throw (0, errors_1.badRequest)('Invalid request');
    await (0, aftercare_repository_1.updateAftercarePlanOrder)(input.items);
    return { ok: true };
}
async function addAftercarePlan(input) {
    const { steps, ...data } = input;
    return (0, aftercare_repository_1.createAftercarePlan)(data, steps);
}
async function changeAftercarePlan(id, input) {
    const { steps, ...data } = input;
    if (Array.isArray(steps))
        await (0, aftercare_repository_1.replaceAftercareSteps)(id, steps);
    return (0, aftercare_repository_1.updateAftercarePlan)(id, data);
}
async function removeAftercarePlan(id) {
    await (0, aftercare_repository_1.deleteAftercarePlan)(id);
    return { ok: true };
}
