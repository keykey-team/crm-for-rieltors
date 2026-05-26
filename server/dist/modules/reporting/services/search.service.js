"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchDashboard = searchDashboard;
const roles_1 = require("../../../common/shared-kernel/roles");
const search_repository_1 = require("../repositories/search.repository");
function ownership(role, userId) {
    return (0, roles_1.isAdminRole)(role) ? {} : { assignedToId: userId };
}
async function searchDashboard(query, userId, role) {
    const q = (typeof query.q === 'string' ? query.q : '').trim();
    if (!q || q.length < 2)
        return { leads: [], deals: [], properties: [], tasks: [] };
    return (0, search_repository_1.searchRecords)(q, ownership(role, userId));
}
