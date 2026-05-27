"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listFunnels = void 0;
exports.addFunnel = addFunnel;
exports.changeFunnel = changeFunnel;
exports.removeFunnel = removeFunnel;
const errors_1 = require("../../../common/shared-kernel/errors");
const funnel_repository_1 = require("../repositories/funnel.repository");
const MAX_FUNNELS = 10;
exports.listFunnels = funnel_repository_1.findFunnels;
async function addFunnel(input) {
    const name = String(input.name ?? '').trim();
    if (!name)
        throw (0, errors_1.badRequest)('name required');
    if (name.length > 80)
        throw (0, errors_1.badRequest)('name too long');
    const count = await (0, funnel_repository_1.countFunnels)();
    if (count >= MAX_FUNNELS)
        throw (0, errors_1.badRequest)(`Max ${MAX_FUNNELS} funnels allowed`);
    return (0, funnel_repository_1.createFunnel)({ name });
}
async function changeFunnel(input) {
    const id = String(input.id ?? '');
    if (!id)
        throw (0, errors_1.badRequest)('id required');
    const name = String(input.name ?? '').trim();
    if (!name)
        throw (0, errors_1.badRequest)('name required');
    return (0, funnel_repository_1.updateFunnel)(id, { name });
}
async function removeFunnel(idInput) {
    const id = String(idInput ?? '');
    if (!id)
        throw (0, errors_1.badRequest)('id required');
    const funnel = await (0, funnel_repository_1.findFunnel)(id);
    if (!funnel)
        throw (0, errors_1.badRequest)('Not found');
    if (funnel.isDefault)
        throw (0, errors_1.forbidden)('Cannot delete default funnel');
    await (0, funnel_repository_1.deactivateFunnel)(id);
    return { ok: true };
}
