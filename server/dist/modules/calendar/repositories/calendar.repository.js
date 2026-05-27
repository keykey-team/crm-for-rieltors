"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findEvents = findEvents;
exports.createEvent = createEvent;
exports.updateEvent = updateEvent;
exports.deleteEvent = deleteEvent;
exports.findCalendarToken = findCalendarToken;
exports.updateCalendarToken = updateCalendarToken;
exports.findUserByCalendarToken = findUserByCalendarToken;
const prisma_1 = require("../../../common/infrastructure/db/prisma");
async function findEvents(where, take = 200) {
    return prisma_1.prisma.event.findMany({
        where: where,
        orderBy: { startDate: 'asc' },
        take,
        include: { user: { select: { id: true, name: true } } },
    });
}
async function createEvent(data) {
    return prisma_1.prisma.event.create({ data: data });
}
async function updateEvent(id, data) {
    return prisma_1.prisma.event.update({ where: { id }, data: data });
}
async function deleteEvent(id) {
    return prisma_1.prisma.event.delete({ where: { id } });
}
async function findCalendarToken(userId) {
    return prisma_1.prisma.user.findUnique({
        where: { id: userId },
        select: { calendarToken: true },
    });
}
async function updateCalendarToken(userId, token) {
    return prisma_1.prisma.user.update({
        where: { id: userId },
        data: { calendarToken: token },
    });
}
async function findUserByCalendarToken(token) {
    return prisma_1.prisma.user.findFirst({
        where: { calendarToken: token },
        select: { id: true, name: true },
    });
}
