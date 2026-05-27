'use client';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { CalendarDays, Plus, ChevronLeft, ChevronRight, Clock, MapPin, Trash2, X, Edit2, Link2, Copy, Check, RefreshCw, ExternalLink } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useTranslation } from '@/shared/lib/i18n/context';
import { HintTooltip } from '@/shared/ui/hint-tooltip';
import type { CalendarEventUpsertInput } from '@/entities/calendar';
import { getEventsByMonth, createEvent, updateEvent, deleteEvent, getCalendarToken, createCalendarToken, revokeCalendarToken } from '@/entities/calendar';
import { EVENT_COLORS, formatTime, getMonday, isSameDay, type ViewMode } from '@/widgets/calendar/model/calendar-utils';

function toLocalDateInputValue(date: Date): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function toLocalDateTimeInputValue(date: Date): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function toLocalDateParts(date: Date) {
  const localValue = toLocalDateTimeInputValue(date);
  const [day, time] = localValue.split('T');
  const [hour, minute] = time.split(':');
  return { day, hour: Number(hour), minute: Number(minute) };
}

function toIsoFromLocalParts(day: string, hour: number, minute: number): string {
  const d = new Date(`${day}T00:00`);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function getEventLayout(event: any) {
  const start = new Date(event.startDate);
  const end = event.endDate ? new Date(event.endDate) : new Date(start.getTime() + 60 * 60000);
  const durationMin = Math.max(30, Math.round((end.getTime() - start.getTime()) / 60000));
  return {
    top: start.getMinutes(),
    minHeight: durationMin,
  };
}

export function CalendarClient() {
  const { t } = useTranslation();
  const DAYS_SHORT = [t('calendar.mon'), t('calendar.tue'), t('calendar.wed'), t('calendar.thu'), t('calendar.fri'), t('calendar.sat'), t('calendar.sun')];
  const MONTHS = [t('calendar.january'), t('calendar.february'), t('calendar.march'), t('calendar.april'), t('calendar.may'), t('calendar.june'), t('calendar.july'), t('calendar.august'), t('calendar.september'), t('calendar.october'), t('calendar.november'), t('calendar.december')];

  const [view, setView] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [popoverEvent, setPopoverEvent] = useState<any>(null);
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number } | null>(null);
  const [syncOpen, setSyncOpen] = useState(false);
  const [calToken, setCalToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const today = useMemo(() => new Date(), []);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const fetchEvents = useCallback(async () => {
    // Fetch 3 months around current to cover week view edges
    const promises = [-1, 0, 1].map(offset => {
      const m = month + 1 + offset;
      const y = m <= 0 ? year - 1 : m > 12 ? year + 1 : year;
      const mm = m <= 0 ? 12 + m : m > 12 ? m - 12 : m;
      return getEventsByMonth(mm, y).catch(() => []);
    });
    const results = await Promise.all(promises);
    const all = results.flat().filter(Boolean);
    // Deduplicate
    const unique = Array.from(new Map(all.map((e: any) => [e.id, e])).values());
    setEvents(unique);
  }, [month, year]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // Calendar sync
  const fetchToken = useCallback(async () => {
    const d = await getCalendarToken();
    setCalToken(d.token ?? null);
  }, []);

  const generateToken = async () => {
    setTokenLoading(true);
    const d = await createCalendarToken();
    setCalToken(d.token);
    setTokenLoading(false);
  };

  const revokeToken = async () => {
    setTokenLoading(true);
    await revokeCalendarToken();
    setCalToken(null);
    setTokenLoading(false);
  };

  const getIcsUrl = () => {
    if (!calToken) return '';
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    return `${base}/api/calendar/ics?token=${calToken}`;
  };

  const copyIcsUrl = () => {
    navigator.clipboard.writeText(getIcsUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => { if (syncOpen) fetchToken(); }, [syncOpen, fetchToken]);

  const handleAddEvent = async (data: CalendarEventUpsertInput) => {
    if (selectedEvent) {
      await updateEvent(selectedEvent.id, data);
    } else {
      await createEvent(data);
    }
    setDialogOpen(false);
    setSelectedEvent(null);
    fetchEvents();
  };

  const handleDeleteEvent = async (id: string) => {
    await deleteEvent(id);
    setPopoverEvent(null);
    fetchEvents();
  };

  const openNewEvent = (dateStr: string) => {
    setSelectedEvent(null);
    setSelectedDate(dateStr);
    setDialogOpen(true);
    setPopoverEvent(null);
  };

  const openEditEvent = (ev: any) => {
    setSelectedEvent(ev);
    setSelectedDate(null);
    setDialogOpen(true);
    setPopoverEvent(null);
  };

  const showEventPopover = (ev: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setPopoverPos({ x: Math.min(rect.left, window.innerWidth - 280), y: rect.bottom + 4 });
    setPopoverEvent(ev);
  };

  // Navigation
  const goBack = () => {
    if (view === 'month') setCurrentDate(new Date(year, month - 1, 1));
    else if (view === 'week') setCurrentDate(new Date(currentDate.getTime() - 7 * 86400000));
    else setCurrentDate(new Date(currentDate.getTime() - 86400000));
  };
  const goForward = () => {
    if (view === 'month') setCurrentDate(new Date(year, month + 1, 1));
    else if (view === 'week') setCurrentDate(new Date(currentDate.getTime() + 7 * 86400000));
    else setCurrentDate(new Date(currentDate.getTime() + 86400000));
  };
  const goToday = () => setCurrentDate(new Date());

  // Title
  const headerTitle = useMemo(() => {
    if (view === 'month') return `${MONTHS[month]} ${year}`;
    if (view === 'day') {
      return `${currentDate.getDate()} ${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
    const monday = getMonday(currentDate);
    const sunday = new Date(monday.getTime() + 6 * 86400000);
    if (monday.getMonth() === sunday.getMonth()) return `${monday.getDate()}–${sunday.getDate()} ${MONTHS[monday.getMonth()]} ${monday.getFullYear()}`;
    return `${monday.getDate()} ${MONTHS[monday.getMonth()]} – ${sunday.getDate()} ${MONTHS[sunday.getMonth()]}`;
  }, [view, currentDate, month, year, MONTHS]);

  const getEventsForDay = useCallback((date: Date) => {
    return events.filter((e: any) => {
      const d = new Date(e?.startDate);
      return isSameDay(d, date);
    }).sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [events]);

  return (
    <div className="space-y-4" onClick={() => setPopoverEvent(null)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#073B34] to-emerald-800 flex items-center justify-center shadow-sm">
            <CalendarDays className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold tracking-tight"><HintTooltip text={t('hints.calendar')} position="bottom">{t('calendar.title')}</HintTooltip></h1>
            <p className="text-xs text-muted-foreground mt-0.5">{t('calendar.subtitle')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setSyncOpen(true)}
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition">
            <Link2 className="w-4 h-4" /> {t('calendar.sync')}
          </button>
          <button onClick={() => openNewEvent(toLocalDateInputValue(new Date()))}
            className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition active:scale-95">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">{t('calendar.newEvent')}</span>
          </button>
        </div>
      </div>

      {/* Controls bar */}
      <div className="bg-card rounded-2xl border border-border/50 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-3" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex items-center gap-0.5 sm:gap-1">
          <button onClick={goBack} className="p-1.5 sm:p-2 rounded-xl hover:bg-muted transition active:scale-95">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={goForward} className="p-1.5 sm:p-2 rounded-xl hover:bg-muted transition active:scale-95">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={goToday} className="ml-0.5 sm:ml-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg hover:bg-muted transition">{t('calendar.today')}</button>
        </div>
        <h2 className="font-display font-semibold text-sm sm:text-lg truncate">{headerTitle}</h2>
        <div className="flex bg-muted rounded-xl p-0.5">
          {(['day', 'week', 'month'] as ViewMode[]).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={cn('px-2 sm:px-3.5 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all',
                view === v ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
              {t(`calendar.view.${v}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar body */}
      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
        {view === 'month' && (
          <MonthView
            year={year} month={month} today={today}
            daysShort={DAYS_SHORT} getEventsForDay={getEventsForDay}
            onDayClick={openNewEvent} onEventClick={showEventPopover}
          />
        )}
        {view === 'week' && (
          <WeekView
            currentDate={currentDate} today={today}
            daysShort={DAYS_SHORT} getEventsForDay={getEventsForDay}
            onSlotClick={openNewEvent} onEventClick={showEventPopover}
          />
        )}
        {view === 'day' && (
          <DayView
            currentDate={currentDate} today={today}
            getEventsForDay={getEventsForDay}
            onSlotClick={openNewEvent} onEventClick={showEventPopover}
            daysShort={DAYS_SHORT}
          />
        )}
      </div>

      {/* Event popover */}
      {popoverEvent && popoverPos && (
        <div className="fixed z-[100]" style={{ left: popoverPos.x, top: popoverPos.y }} onClick={e => e.stopPropagation()}>
          <EventPopover event={popoverEvent} t={t}
            onEdit={() => openEditEvent(popoverEvent)}
            onDelete={() => handleDeleteEvent(popoverEvent.id)}
            onClose={() => setPopoverEvent(null)} />
        </div>
      )}

      {/* Dialog */}
      {dialogOpen && (
        <EventDialog
          date={selectedDate}
          event={selectedEvent}
          onSave={handleAddEvent}
          onClose={() => { setDialogOpen(false); setSelectedEvent(null); }}
          t={t}
        />
      )}

      {/* Sync dialog */}
      {syncOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setSyncOpen(false)}>
          <div className="bg-card rounded-2xl w-full max-w-lg" style={{ boxShadow: 'var(--shadow-lg)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
              <h2 className="font-display font-bold text-lg flex items-center gap-2">
                <Link2 className="w-5 h-5 text-primary" /> {t('calendar.syncTitle')}
              </h2>
              <button onClick={() => setSyncOpen(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-5">
              <p className="text-sm text-muted-foreground">{t('calendar.syncDesc')}</p>

              {!calToken ? (
                <div className="text-center py-4">
                  <button onClick={generateToken} disabled={tokenLoading}
                    className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-50">
                    {tokenLoading ? t('common.loading') : t('calendar.generateLink')}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* ICS URL */}
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">{t('calendar.subscriptionUrl')}</label>
                    <div className="flex gap-2">
                      <input readOnly value={getIcsUrl()} className="flex-1 px-3 py-2 rounded-xl border border-border bg-muted/30 text-xs font-mono truncate" />
                      <button onClick={copyIcsUrl}
                        className={cn('px-3 py-2 rounded-xl border text-sm font-medium transition flex items-center gap-1.5',
                          copied ? 'bg-green-50 border-green-200 text-green-700' : 'border-border hover:bg-muted')}>
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? t('calendar.copied') : t('calendar.copyLink')}
                      </button>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-lg">📅</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-blue-900">Google Calendar</p>
                        <p className="text-xs text-blue-700 mt-0.5">{t('calendar.googleInstructions')}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
                      <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-lg">🍎</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Apple Calendar</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{t('calendar.appleInstructions')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Revoke */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/30">
                    <div className="flex items-center gap-2">
                      <button onClick={generateToken} disabled={tokenLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition">
                        <RefreshCw className={cn('w-3 h-3', tokenLoading && 'animate-spin')} /> {t('calendar.regenerate')}
                      </button>
                    </div>
                    <button onClick={revokeToken} disabled={tokenLoading}
                      className="text-xs text-destructive hover:text-destructive/80 transition">
                      {t('calendar.revoke')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Month View ─── */
function MonthView({ year, month, today, daysShort, getEventsForDay, onDayClick, onEventClick }: any) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();
  const prevMonthLast = new Date(year, month, 0).getDate();

  const cells: { day: number; current: boolean; date: Date }[] = [];
  for (let i = startDay - 1; i >= 0; i--) {
    const d = prevMonthLast - i;
    cells.push({ day: d, current: false, date: new Date(year, month - 1, d) });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ day: i, current: true, date: new Date(year, month, i) });
  }
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      cells.push({ day: i, current: false, date: new Date(year, month + 1, i) });
    }
  }

  return (
    <div>
      <div className="grid grid-cols-7 border-b border-border/30">
        {daysShort.map((d: string) => (
          <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2.5 uppercase tracking-wider">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((cell, idx) => {
          const dayEvents = getEventsForDay(cell.date);
          const isToday = cell.current && isSameDay(cell.date, today);
          const dateStr = `${cell.date.getFullYear()}-${String(cell.date.getMonth() + 1).padStart(2, '0')}-${String(cell.date.getDate()).padStart(2, '0')}`;
          return (
            <div key={idx}
              onClick={() => onDayClick(dateStr)}
              className={cn(
                'min-h-[60px] sm:min-h-[100px] p-1 sm:p-1.5 border-b border-r border-border/15 cursor-pointer hover:bg-muted/30 transition-colors relative',
                !cell.current && 'bg-muted/10',
                idx % 7 === 0 && 'border-l-0'
              )}>
              <div className="flex justify-center mb-0.5 sm:mb-1">
                <span className={cn(
                  'inline-flex w-6 h-6 sm:w-7 sm:h-7 items-center justify-center rounded-full text-[10px] sm:text-xs font-medium transition-colors',
                  isToday && 'bg-primary text-white',
                  !cell.current && 'text-muted-foreground/60',
                  cell.current && !isToday && 'text-foreground',
                )}>{cell.day}</span>
              </div>
              <div className="space-y-0.5 hidden sm:block">
                {dayEvents.slice(0, 3).map((ev: any) => {
                  const colors = EVENT_COLORS[ev.type] ?? EVENT_COLORS.other;
                  return (
                    <div key={ev.id}
                      onClick={(e) => onEventClick(ev, e)}
                      className={cn('text-[10px] leading-tight px-1.5 py-[3px] rounded-md truncate font-medium cursor-pointer hover:opacity-80 transition', colors.bg, colors.text)}>
                      {formatTime(new Date(ev.startDate))} {ev.title}
                    </div>
                  );
                })}
                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-muted-foreground font-medium px-1.5">+{dayEvents.length - 3}</div>
                )}
              </div>
              {/* Mobile: dot indicators */}
              {dayEvents.length > 0 && (
                <div className="flex justify-center gap-0.5 sm:hidden mt-0.5">
                  {dayEvents.slice(0, 3).map((ev: any) => (
                    <div key={ev.id} className="w-1 h-1 rounded-full bg-primary" />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Week View ─── */
function WeekView({ currentDate, today, daysShort, getEventsForDay, onSlotClick, onEventClick }: any) {
  const monday = getMonday(currentDate);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });
  const hours = Array.from({ length: 24 }, (_, i) => i); // 00:00 - 23:00
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const now = new Date();
      const scrollTo = Math.max(0, (now.getHours() - 0.5) * 60);
      scrollRef.current.scrollTop = scrollTo;
    }
  }, []);

  return (
    <div>
      {/* Day headers */}
      <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-border/30 sticky top-0 bg-card z-10">
        <div className="border-r border-border/15" />
        {days.map((d, i) => {
          const isToday = isSameDay(d, today);
          return (
            <div key={i} className={cn('text-center py-2.5 border-r border-border/15 last:border-r-0', isToday && 'bg-primary/5')}>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">{daysShort[i]}</div>
              <div className={cn('text-lg font-semibold mt-0.5', isToday ? 'text-primary' : 'text-foreground')}>{d.getDate()}</div>
            </div>
          );
        })}
      </div>
      {/* Time grid */}
      <div ref={scrollRef} className="overflow-y-auto max-h-[600px]">
        <div className="grid grid-cols-[56px_repeat(7,1fr)] relative">
          {/* Now indicator */}
          {days.some(d => isSameDay(d, today)) && (() => {
            const now = new Date();
            const top = (now.getHours() + now.getMinutes() / 60) * 60;
            const dayIdx = days.findIndex(d => isSameDay(d, today));
            if (top < 0 || dayIdx < 0) return null;
            return (
              <div className="absolute z-20 pointer-events-none" style={{ top: `${top}px`, left: `calc(56px + ${dayIdx} * ((100% - 56px) / 7))`, width: `calc((100% - 56px) / 7)` }}>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-red-500 -ml-1" />
                  <div className="flex-1 h-[1.5px] bg-red-500" />
                </div>
              </div>
            );
          })()}
          {hours.map(h => (
            <div key={h} className="contents">
              <div className="h-[60px] border-r border-border/15 flex items-start justify-end pr-2 pt-0 text-[10px] text-muted-foreground font-medium">
                {String(h).padStart(2, '0')}:00
              </div>
              {days.map((d, di) => {
                const dayEvents = getEventsForDay(d).filter((ev: any) => {
                  const evH = new Date(ev.startDate).getHours();
                  return evH === h;
                });
                const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                return (
                  <div key={di}
                    onClick={() => onSlotClick(dateStr)}
                    className={cn('h-[60px] border-r border-b border-border/10 last:border-r-0 cursor-pointer hover:bg-muted/20 transition-colors relative',
                      isSameDay(d, today) && 'bg-primary/[0.02]')}>
                    {dayEvents.map((ev: any) => {
                      const colors = EVENT_COLORS[ev.type] ?? EVENT_COLORS.other;
                      const layout = getEventLayout(ev);
                      return (
                        <div key={ev.id}
                          onClick={(e) => onEventClick(ev, e)}
                          className={cn('absolute left-0.5 right-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium overflow-hidden cursor-pointer hover:opacity-90 z-10', colors.bg, colors.text)}
                          style={{ top: `${layout.top}px`, minHeight: `${layout.minHeight}px` }}>
                          <div className="truncate">{ev.title}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Day View ─── */
function DayView({ currentDate, today, getEventsForDay, onSlotClick, onEventClick, daysShort }: any) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dayEvents = getEventsForDay(currentDate);
  const isToday = isSameDay(currentDate, today);
  const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
  const dayOfWeek = (currentDate.getDay() + 6) % 7;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const now = new Date();
      const scrollTo = Math.max(0, (now.getHours() - 0.5) * 60);
      scrollRef.current.scrollTop = scrollTo;
    }
  }, []);

  return (
    <div>
      <div className={cn('text-center py-3 border-b border-border/30', isToday && 'bg-primary/5')}>
        <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">{daysShort[dayOfWeek]}</div>
        <div className={cn('text-2xl font-bold mt-0.5', isToday ? 'text-primary' : 'text-foreground')}>{currentDate.getDate()}</div>
      </div>
      <div ref={scrollRef} className="overflow-y-auto max-h-[600px]">
        <div className="grid grid-cols-[56px_1fr] relative">
          {/* Now indicator */}
          {isToday && (() => {
            const now = new Date();
            const top = (now.getHours() + now.getMinutes() / 60) * 60;
            if (top < 0) return null;
            return (
              <div className="absolute z-20 pointer-events-none" style={{ top: `${top}px`, left: '56px', right: 0 }}>
                <div className="flex items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1.5" />
                  <div className="flex-1 h-[2px] bg-red-500" />
                </div>
              </div>
            );
          })()}
          {hours.map(h => {
            const hourEvents = dayEvents.filter((ev: any) => new Date(ev.startDate).getHours() === h);
            return (
              <div key={h} className="contents">
                <div className="h-[60px] border-r border-border/15 flex items-start justify-end pr-2 text-[10px] text-muted-foreground font-medium">
                  {String(h).padStart(2, '0')}:00
                </div>
                <div onClick={() => onSlotClick(dateStr)}
                  className="h-[60px] border-b border-border/10 cursor-pointer hover:bg-muted/20 transition-colors relative">
                  {hourEvents.map((ev: any) => {
                    const colors = EVENT_COLORS[ev.type] ?? EVENT_COLORS.other;
                    const layout = getEventLayout(ev);
                    return (
                      <div key={ev.id}
                        onClick={(e) => onEventClick(ev, e)}
                        className={cn('absolute left-1 right-1 rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer hover:opacity-90 z-10 shadow-sm', colors.bg, colors.text)}
                        style={{ top: `${layout.top}px`, minHeight: `${layout.minHeight}px` }}>
                        <div className="font-semibold">{ev.title}</div>
                        <div className="text-[10px] opacity-75">
                          {formatTime(new Date(ev.startDate))} - {formatTime(ev.endDate ? new Date(ev.endDate) : new Date(new Date(ev.startDate).getTime() + 60 * 60000))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Event Popover ─── */
function EventPopover({ event, t, onEdit, onDelete, onClose }: any) {
  const colors = EVENT_COLORS[event.type] ?? EVENT_COLORS.other;
  const start = new Date(event.startDate);
  const end = event.endDate ? new Date(event.endDate) : new Date(start.getTime() + 60 * 60000);
  return (
    <div className="bg-card rounded-xl border border-border/50 w-72 overflow-hidden" style={{ boxShadow: 'var(--shadow-lg)' }}>
      <div className={cn('px-4 py-3 flex items-start justify-between', colors.bg)}>
        <div className="flex-1 min-w-0">
          <h3 className={cn('font-semibold text-sm truncate', colors.text)}>{event.title}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <Clock className={cn('w-3 h-3', colors.text)} />
            <span className={cn('text-xs', colors.text)}>
              {start.toLocaleDateString()} · {formatTime(start)} - {formatTime(end)}
            </span>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-black/5"><X className="w-3.5 h-3.5" /></button>
      </div>
      <div className="px-4 py-3 flex items-center gap-2 border-t border-border/20">
        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', colors.bg, colors.text)}>
          {t(`calendar.${event.type}`) || event.type}
        </span>
        <div className="flex-1" />
        <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-muted transition" title={t('common.edit')}>
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-destructive/10 transition" title={t('common.delete')}>
          <Trash2 className="w-3.5 h-3.5 text-destructive" />
        </button>
      </div>
    </div>
  );
}

/* ─── Event Dialog ─── */
function EventDialog({ date, event, onSave, onClose, t }: { date: string | null; event?: any; onSave: (d: any) => void; onClose: () => void; t: (k: string) => string }) {
  const initialStart = event ? new Date(event.startDate) : new Date(`${date ?? toLocalDateInputValue(new Date())}T10:00`);
  const initialEnd = event?.endDate ? new Date(event.endDate) : new Date(initialStart.getTime() + 60 * 60000);
  const startParts = toLocalDateParts(initialStart);
  const endParts = toLocalDateParts(initialEnd);
  const [form, setForm] = useState({
    title: event?.title ?? '',
    type: event?.type ?? 'meeting',
    day: startParts.day,
    startHour: startParts.hour,
    startMinute: startParts.minute,
    endHour: endParts.hour,
    endMinute: endParts.minute,
    description: event?.description ?? '',
  });
  const [saving, setSaving] = useState(false);
  const HOURS = Array.from({ length: 24 }, (_, i) => i);
  const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);
  const startPreview = `${String(form.startHour).padStart(2, '0')}:${String(form.startMinute).padStart(2, '0')}`;
  const endPreview = `${String(form.endHour).padStart(2, '0')}:${String(form.endMinute).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl w-full max-w-md" style={{ boxShadow: 'var(--shadow-lg)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
          <h2 className="font-display font-bold text-lg">{event ? t('calendar.editEvent') : t('calendar.newEvent')}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={async (e) => {
          e.preventDefault();
          const startIso = toIsoFromLocalParts(form.day, form.startHour, form.startMinute);
          const endIso = toIsoFromLocalParts(form.day, form.endHour, form.endMinute);
          const start = new Date(startIso);
          const endRaw = new Date(endIso);
          const end = endRaw > start ? endRaw : new Date(start.getTime() + 30 * 60000);
          setSaving(true);
          await onSave({
            title: form.title,
            type: form.type,
            description: form.description,
            startDate: start.toISOString(),
            endDate: end.toISOString(),
          });
          setSaving(false);
        }} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t('common.title')} *</label>
            <input value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} required
              className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t('common.type')}</label>
            <div className="flex gap-2 flex-wrap">
              {['meeting', 'showing', 'call', 'other'].map(type => {
                const colors = EVENT_COLORS[type];
                return (
                  <button key={type} type="button" onClick={() => setForm(p => ({ ...p, type }))}
                    className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border',
                      form.type === type ? `${colors.bg} ${colors.text} border-current shadow-sm` : 'border-border text-muted-foreground hover:text-foreground')}>
                    <div className={cn('w-2 h-2 rounded-full', colors.dot)} />
                    {t(`calendar.${type}`)}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t('calendar.dateTime')}</label>
            <DatePicker value={form.day} onChange={(v) => setForm(p => ({ ...p, day: v }))} />
          </div>

          <div className="rounded-2xl border border-border/60 bg-muted/20 p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Time Range</p>
              <p className="text-sm font-semibold text-primary">{startPreview} - {endPreview}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border/60 bg-card p-2">
                <p className="text-xs font-medium text-muted-foreground mb-2">From</p>
                <div className="grid grid-cols-2 gap-2">
                  <TimeWheel values={HOURS} selected={form.startHour} onChange={(v) => setForm(p => ({ ...p, startHour: v }))} />
                  <TimeWheel values={MINUTES} selected={form.startMinute} onChange={(v) => setForm(p => ({ ...p, startMinute: v }))} />
                </div>
              </div>
              <div className="rounded-xl border border-border/60 bg-card p-2">
                <p className="text-xs font-medium text-muted-foreground mb-2">To</p>
                <div className="grid grid-cols-2 gap-2">
                  <TimeWheel values={HOURS} selected={form.endHour} onChange={(v) => setForm(p => ({ ...p, endHour: v }))} />
                  <TimeWheel values={MINUTES} selected={form.endMinute} onChange={(v) => setForm(p => ({ ...p, endMinute: v }))} />
                </div>
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t('common.description')}</label>
            <textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition">{t('common.cancel')}</button>
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-50">
              {saving ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TimeWheel({ values, selected, onChange }: { values: number[]; selected: number; onChange: (v: number) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const idx = values.indexOf(selected);
    if (idx < 0) return;
    const buttons = container.querySelectorAll<HTMLButtonElement>('button');
    const btn = buttons[idx];
    if (!btn) return;
    // getBoundingClientRect to calculate position relative to container, then scroll so that the button is centered
    const btnRect = btn.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const relativeTop = btnRect.top - containerRect.top + container.scrollTop;
    const top = relativeTop - container.clientHeight / 2 + btn.offsetHeight / 2;
    if (isFirstRender.current) {
      container.scrollTop = top;
      isFirstRender.current = false;
    } else {
      container.scrollTo({ top, behavior: 'smooth' });
    }
  }, [selected, values]);

  return (
    <div ref={containerRef} className="h-28 overflow-y-auto rounded-lg border border-border/50 bg-muted/10 p-1 space-y-1 scrollbar-none">
      {values.map((value) => {
        const isActive = value === selected;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            className={cn(
              'w-full py-1.5 rounded-md text-sm font-mono transition',
              isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted text-muted-foreground hover:text-foreground'
            )}>
            {String(value).padStart(2, '0')}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Date Picker ─── */
function DatePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useTranslation();
  const MONTHS_FULL = [
    t('calendar.january'), t('calendar.february'), t('calendar.march'),
    t('calendar.april'), t('calendar.may'), t('calendar.june'),
    t('calendar.july'), t('calendar.august'), t('calendar.september'),
    t('calendar.october'), t('calendar.november'), t('calendar.december'),
  ];
  const DAYS_SHORT = [
    t('calendar.mon'), t('calendar.tue'), t('calendar.wed'),
    t('calendar.thu'), t('calendar.fri'), t('calendar.sat'), t('calendar.sun'),
  ];

  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => value ? new Date(value + 'T00:00') : new Date());
  const ref = useRef<HTMLDivElement>(null);
  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (value) setViewDate(new Date(value + 'T00:00'));
  }, [value]);

  const selected = value ? new Date(value + 'T00:00') : null;
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const startDay = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthLast = new Date(year, month, 0).getDate();

  const cells: { day: number; current: boolean; date: Date }[] = [];
  for (let i = startDay - 1; i >= 0; i--)
    cells.push({ day: prevMonthLast - i, current: false, date: new Date(year, month - 1, prevMonthLast - i) });
  for (let i = 1; i <= daysInMonth; i++)
    cells.push({ day: i, current: true, date: new Date(year, month, i) });
  const remaining = (7 - (cells.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++)
    cells.push({ day: i, current: false, date: new Date(year, month + 1, i) });

  const displayValue = selected
    ? `${String(selected.getDate()).padStart(2, '0')}.${String(selected.getMonth() + 1).padStart(2, '0')}.${selected.getFullYear()}`
    : '';

  const selectDate = (date: Date) => {
    const str = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    onChange(str);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={cn(
          'w-full flex items-center gap-2.5 pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-left transition bg-card',
          open ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
        )}>
        <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <span className={displayValue ? 'text-foreground' : 'text-muted-foreground'}>
          {displayValue || '—'}
        </span>
      </button>

      {open && (
        <div
          className="absolute z-50 top-full mt-1.5 left-0 bg-card rounded-2xl border border-border/50 p-3 w-64"
          style={{ boxShadow: 'var(--shadow-lg)' }}
          onClick={e => e.stopPropagation()}>
          {/*Navigation by month*/}
          <div className="flex items-center justify-between mb-2">
            <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))}
              className="p-1.5 rounded-lg hover:bg-muted transition">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-sm font-semibold">{MONTHS_FULL[month]} {year}</span>
            <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))}
              className="p-1.5 rounded-lg hover:bg-muted transition">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Headings of the day*/}
          <div className="grid grid-cols-7 mb-1">
            {DAYS_SHORT.map(d => (
              <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground uppercase py-1">{d}</div>
            ))}
          </div>

          {/* Grid of days */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {cells.map((cell, idx) => {
              const isSelected = selected && isSameDay(cell.date, selected);
              const isToday = isSameDay(cell.date, today);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectDate(cell.date)}
                  className={cn(
                    'h-7 w-full flex items-center justify-center rounded-lg text-xs font-medium transition',
                    isSelected ? 'bg-primary text-primary-foreground' :
                    isToday ? 'border border-primary/60 text-primary' :
                    cell.current ? 'text-foreground hover:bg-muted' :
                    'text-muted-foreground/50 hover:bg-muted/50'
                  )}>
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
            <button type="button" onClick={() => { onChange(''); setOpen(false); }}
              className="text-xs text-muted-foreground hover:text-foreground transition px-1">
              {t('common.delete')}
            </button>
            <button type="button" onClick={() => selectDate(today)}
              className="text-xs text-primary hover:text-primary/80 font-medium transition px-1">
              {t('calendar.today')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
