"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leadFacade = void 0;
const lead_repository_1 = require("../repositories/lead.repository");
exports.leadFacade = {
    getLeadRecord: lead_repository_1.findLeadRecord,
    updateLead: lead_repository_1.updateLead,
    updateLeads: lead_repository_1.updateLeads,
};
