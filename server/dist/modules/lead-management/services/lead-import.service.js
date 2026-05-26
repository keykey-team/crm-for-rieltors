"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importLeads = importLeads;
const errors_1 = require("../../../common/shared-kernel/errors");
const lead_repository_1 = require("../repositories/lead.repository");
async function importLeads(input, userId) {
    const leads = input.leads;
    if (!Array.isArray(leads) || !leads.length)
        throw (0, errors_1.badRequest)('No leads provided');
    let imported = 0;
    let skipped = 0;
    const errors = [];
    for (let index = 0; index < leads.length; index++) {
        const row = leads[index];
        const firstName = String(row.firstName || row.name || '').trim();
        const phone = String(row.phone || '').trim();
        if (!firstName || !phone) {
            skipped++;
            errors.push(`row ${index + 2}: missing firstName or phone`);
            continue;
        }
        try {
            await (0, lead_repository_1.createLead)({
                firstName,
                lastName: String(row.lastName || '').trim() || null,
                phone,
                email: String(row.email || '').trim() || null,
                source: row.source || 'manual',
                status: 'new',
                needType: row.needType || 'buy',
                budget: row.budget ? parseFloat(String(row.budget)) : null,
                districts: String(row.districts || '').trim() || null,
                propertyType: String(row.propertyType || '').trim() || null,
                notes: String(row.notes || '').trim() || null,
                assignedToId: userId || null,
            });
            imported++;
        }
        catch (error) {
            skipped++;
            errors.push(`row ${index + 2}: ${String(error?.message || 'error').slice(0, 80)}`);
        }
    }
    return { imported, skipped, errors: errors.slice(0, 10) };
}
