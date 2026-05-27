"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findLeads = findLeads;
exports.createLead = createLead;
exports.findLeadById = findLeadById;
exports.findLeadRecord = findLeadRecord;
exports.updateLead = updateLead;
exports.deleteLead = deleteLead;
exports.deleteLeads = deleteLeads;
exports.updateLeads = updateLeads;
const prisma_1 = require("../../../common/infrastructure/db/prisma");
async function findLeads(where) {
    return prisma_1.prisma.lead.findMany({
        where: where,
        orderBy: { createdAt: 'desc' },
        take: 200,
        include: { assignedTo: { select: { id: true, name: true, avatar: true } } },
    });
}
async function createLead(data) {
    return prisma_1.prisma.lead.create({ data: data });
}
async function findLeadById(id) {
    return prisma_1.prisma.lead.findUnique({
        where: { id },
        include: {
            assignedTo: { select: { id: true, name: true, email: true } },
            deals: true,
            tasks: true,
        },
    });
}
async function findLeadRecord(id) {
    return prisma_1.prisma.lead.findUnique({ where: { id } });
}
async function updateLead(id, data) {
    return prisma_1.prisma.lead.update({ where: { id }, data: data });
}
async function deleteLead(id) {
    return prisma_1.prisma.lead.delete({ where: { id } });
}
async function deleteLeads(where) {
    return prisma_1.prisma.lead.deleteMany({ where: where });
}
async function updateLeads(where, data) {
    return prisma_1.prisma.lead.updateMany({ where: where, data: data });
}
