"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listEvents = listEvents;
exports.addEvent = addEvent;
exports.changeEvent = changeEvent;
exports.removeEvent = removeEvent;
exports.getCalendarToken = getCalendarToken;
exports.generateCalendarToken = generateCalendarToken;
exports.removeCalendarToken = removeCalendarToken;
exports.buildIcsFeed = buildIcsFeed;
const crypto_1 = __importDefault(require("crypto"));
const errors_1 = require("../../../common/shared-kernel/errors");
const calendar_repository_1 = require("../repositories/calendar.repository");
function eventPayload(input, userId) {
    return {
        title: input.title,
        description: input.description ?? null,
        type: input.type ?? 'meeting',
        startDate: new Date(String(input.startDate)),
        endDate: input.endDate ? new Date(String(input.endDate)) : null,
        allDay: input.allDay ?? false,
        ...(userId ? { userId } : {}),
    };
}
function escapeIcs(value) {
    return (value || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}
function formatIcsDate(date) {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}
async function listEvents(month, year) {
    const where = {};
    if (month && year) {
        where.startDate = {
            gte: new Date(Number(year), Number(month) - 1, 1),
            lte: new Date(Number(year), Number(month), 0, 23, 59, 59),
        };
    }
    return (0, calendar_repository_1.findEvents)(where);
}
async function addEvent(userId, input) {
    return (0, calendar_repository_1.createEvent)(eventPayload(input, userId));
}
async function changeEvent(id, input) {
    return (0, calendar_repository_1.updateEvent)(id, eventPayload(input));
}
async function removeEvent(id) {
    await (0, calendar_repository_1.deleteEvent)(id);
    return { success: true };
}
async function getCalendarToken(userId) {
    const user = await (0, calendar_repository_1.findCalendarToken)(userId);
    return { token: user?.calendarToken ?? null };
}
async function generateCalendarToken(userId) {
    const token = crypto_1.default.randomBytes(32).toString('hex');
    await (0, calendar_repository_1.updateCalendarToken)(userId, token);
    return { token };
}
async function removeCalendarToken(userId) {
    await (0, calendar_repository_1.updateCalendarToken)(userId, null);
    return { success: true };
}
async function buildIcsFeed(token) {
    if (!token)
        throw (0, errors_1.badRequest)('Missing token');
    const user = await (0, calendar_repository_1.findUserByCalendarToken)(token);
    if (!user)
        throw (0, errors_1.unauthorized)('Invalid token');
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 12, 0);
    const events = await (0, calendar_repository_1.findEvents)({ startDate: { gte: from, lte: to } }, 500);
    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//FREEMO R//Calendar//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        `X-WR-CALNAME:FREEMO R - ${escapeIcs(user.name || 'Calendar')}`,
    ];
    for (const event of events) {
        const start = new Date(event.startDate);
        const end = event.endDate ? new Date(event.endDate) : new Date(start.getTime() + 3600000);
        lines.push('BEGIN:VEVENT', `UID:${event.id}@freemor`, `DTSTART:${formatIcsDate(start)}`);
        lines.push(`DTEND:${formatIcsDate(end)}`, `SUMMARY:${escapeIcs(event.title)}`);
        if (event.description)
            lines.push(`DESCRIPTION:${escapeIcs(event.description)}`);
        lines.push(`CATEGORIES:${event.type || 'other'}`, `DTSTAMP:${formatIcsDate(new Date(event.createdAt))}`, 'END:VEVENT');
    }
    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
}
