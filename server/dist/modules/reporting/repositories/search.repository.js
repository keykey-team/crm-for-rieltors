"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchRecords = searchRecords;
const prisma_1 = require("../../../common/infrastructure/db/prisma");
async function searchRecords(q, where) {
    const [leads, deals, properties, tasks] = await Promise.all([
        prisma_1.prisma.lead.findMany({
            where: {
                ...where,
                OR: [
                    { firstName: { contains: q, mode: 'insensitive' } },
                    { lastName: { contains: q, mode: 'insensitive' } },
                    { email: { contains: q, mode: 'insensitive' } },
                    { phone: { contains: q, mode: 'insensitive' } },
                ],
            },
            select: { id: true, firstName: true, lastName: true, phone: true, status: true },
            take: 5,
        }),
        prisma_1.prisma.deal.findMany({
            where: {
                ...where,
                OR: [
                    { title: { contains: q, mode: 'insensitive' } },
                    { notes: { contains: q, mode: 'insensitive' } },
                ],
            },
            select: { id: true, title: true, stage: true, amount: true },
            take: 5,
        }),
        prisma_1.prisma.property.findMany({
            where: {
                OR: [
                    { title: { contains: q, mode: 'insensitive' } },
                    { address: { contains: q, mode: 'insensitive' } },
                ],
            },
            select: { id: true, title: true, address: true, type: true },
            take: 5,
        }),
        prisma_1.prisma.task.findMany({
            where: {
                ...where,
                title: { contains: q, mode: 'insensitive' },
            },
            select: { id: true, title: true, status: true, priority: true },
            take: 5,
        }),
    ]);
    return { leads, deals, properties, tasks };
}
