import crypto from 'crypto';
import { badRequest, unauthorized } from '../../../common/shared-kernel/errors';
import {
  createEvent,
  deleteEvent,
  findCalendarToken,
  findEvents,
  findUserByCalendarToken,
  updateCalendarToken,
  updateEvent,
} from '../repositories/calendar.repository';

function eventPayload(input: Record<string, unknown>, userId?: string) {
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

function escapeIcs(value: string) {
  return (value || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function formatIcsDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

export async function listEvents(month?: string, year?: string) {
  const where: Record<string, unknown> = {};
  if (month && year) {
    where.startDate = {
      gte: new Date(Number(year), Number(month) - 1, 1),
      lte: new Date(Number(year), Number(month), 0, 23, 59, 59),
    };
  }
  return findEvents(where);
}

export async function addEvent(userId: string | undefined, input: Record<string, unknown>) {
  return createEvent(eventPayload(input, userId));
}

export async function changeEvent(id: string, input: Record<string, unknown>) {
  return updateEvent(id, eventPayload(input));
}

export async function removeEvent(id: string) {
  await deleteEvent(id);
  return { success: true };
}

export async function getCalendarToken(userId: string) {
  const user = await findCalendarToken(userId);
  return { token: user?.calendarToken ?? null };
}

export async function generateCalendarToken(userId: string) {
  const token = crypto.randomBytes(32).toString('hex');
  await updateCalendarToken(userId, token);
  return { token };
}

export async function removeCalendarToken(userId: string) {
  await updateCalendarToken(userId, null);
  return { success: true };
}

export async function buildIcsFeed(token: string) {
  if (!token) throw badRequest('Missing token');
  const user = await findUserByCalendarToken(token);
  if (!user) throw unauthorized('Invalid token');

  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - 6, 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 12, 0);
  const events = await findEvents({ startDate: { gte: from, lte: to } }, 500);
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
    if (event.description) lines.push(`DESCRIPTION:${escapeIcs(event.description)}`);
    lines.push(`CATEGORIES:${event.type || 'other'}`, `DTSTAMP:${formatIcsDate(new Date(event.createdAt))}`, 'END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

