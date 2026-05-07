export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

function escapeICS(str: string) {
  return (str || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function toICSDate(d: Date) {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    if (!token) {
      return new NextResponse('Missing token', { status: 400 });
    }
    const user = await prisma.user.findFirst({ where: { calendarToken: token }, select: { id: true, name: true } });
    if (!user) {
      return new NextResponse('Invalid token', { status: 401 });
    }
    // Fetch events for the last 6 months and next 12 months
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 12, 0);
    const events = await prisma.event.findMany({
      where: { startDate: { gte: from, lte: to } },
      orderBy: { startDate: 'asc' },
      take: 500,
    });

    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//RealCRM//Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:RealCRM - ${escapeICS(user.name || 'Calendar')}`,
    ];

    for (const ev of events) {
      const start = new Date(ev.startDate);
      const end = ev.endDate ? new Date(ev.endDate) : new Date(start.getTime() + 3600000); // default 1h
      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${ev.id}@realcrm`);
      lines.push(`DTSTART:${toICSDate(start)}`);
      lines.push(`DTEND:${toICSDate(end)}`);
      lines.push(`SUMMARY:${escapeICS(ev.title)}`);
      if (ev.description) lines.push(`DESCRIPTION:${escapeICS(ev.description)}`);
      lines.push(`CATEGORIES:${ev.type || 'other'}`);
      lines.push(`DTSTAMP:${toICSDate(new Date(ev.createdAt))}`);
      lines.push('END:VEVENT');
    }

    lines.push('END:VCALENDAR');

    return new NextResponse(lines.join('\r\n'), {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="realcrm-calendar.ics"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (err: any) {
    return new NextResponse('Error generating calendar', { status: 500 });
  }
}
