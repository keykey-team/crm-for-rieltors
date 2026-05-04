'use client';
import { useState, useEffect, useCallback } from 'react';
import { CalendarDays, Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/context';

export function CalendarClient() {
  const { t } = useTranslation();
  const DAYS = [t('calendar.mon'), t('calendar.tue'), t('calendar.wed'), t('calendar.thu'), t('calendar.fri'), t('calendar.sat'), t('calendar.sun')];
  const MONTHS = [t('calendar.january'), t('calendar.february'), t('calendar.march'), t('calendar.april'), t('calendar.may'), t('calendar.june'), t('calendar.july'), t('calendar.august'), t('calendar.september'), t('calendar.october'), t('calendar.november'), t('calendar.december')];

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const fetchEvents = useCallback(async () => {
    const res = await fetch(`/api/events?month=${month + 1}&year=${year}`);
    const data = await res.json();
    setEvents(Array.isArray(data) ? data : []);
  }, [month, year]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleAddEvent = async (data: any) => {
    await fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    setDialogOpen(false); fetchEvents();
  };

  const handleDeleteEvent = async (id: string) => {
    await fetch(`/api/events/${id}`, { method: 'DELETE' });
    fetchEvents();
  };

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();
  const today = new Date();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  const getEventsForDay = (day: number) => {
    return (events ?? []).filter((e: any) => {
      const d = new Date(e?.startDate);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-primary" /> {t('calendar.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t('calendar.subtitle')}</p>
        </div>
        <button onClick={() => { setSelectedDate(new Date().toISOString().slice(0, 10)); setDialogOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition">
          <Plus className="w-4 h-4" /> {t('calendar.newEvent')}
        </button>
      </div>
      <div className="bg-white rounded-2xl p-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 rounded-xl hover:bg-muted">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="font-display font-bold text-lg">{MONTHS[month]} {year}</h2>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 rounded-xl hover:bg-muted">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {DAYS.map((d) => <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>)}
          {cells.map((day, idx) => {
            if (day === null) return <div key={idx} />;
            const dayEvents = getEventsForDay(day);
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            return (
              <div key={idx}
                onClick={() => { setSelectedDate(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`); setDialogOpen(true); }}
                className={cn(
                  'min-h-[80px] p-2 rounded-xl border border-transparent cursor-pointer hover:bg-muted/50 transition text-sm',
                  isToday && 'bg-primary/5 border-primary/20'
                )}>
                <span className={cn('inline-flex w-7 h-7 items-center justify-center rounded-full text-xs font-medium', isToday && 'bg-primary text-white')}>{day}</span>
                <div className="mt-1 space-y-0.5">
                  {dayEvents.slice(0, 2).map((ev: any) => (
                    <div key={ev?.id} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary truncate flex items-center justify-between group">
                      <span className="truncate">{ev?.title}</span>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteEvent(ev?.id); }}
                        className="opacity-0 group-hover:opacity-100 ml-1 flex-shrink-0">
                        <Trash2 className="w-2.5 h-2.5 text-destructive" />
                      </button>
                    </div>
                  ))}
                  {dayEvents.length > 2 && <div className="text-[10px] text-muted-foreground">+{dayEvents.length - 2}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {dialogOpen && <EventDialog date={selectedDate} onSave={handleAddEvent} onClose={() => setDialogOpen(false)} t={t} />}
    </div>
  );
}

function EventDialog({ date, onSave, onClose, t }: { date: string | null; onSave: (d: any) => void; onClose: () => void; t: (k: string) => string }) {
  const [form, setForm] = useState({ title: '', type: 'meeting', startDate: `${date ?? ''}T10:00`, description: '' });
  const [saving, setSaving] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md" style={{ boxShadow: 'var(--shadow-lg)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-display font-bold text-lg">{t('calendar.newEvent')}</h2>
          <button onClick={onClose} className="text-lg">×</button>
        </div>
        <form onSubmit={async (e) => { e.preventDefault(); setSaving(true); await onSave(form); setSaving(false); }} className="p-6 space-y-4">
          <div><label className="text-sm font-medium mb-1 block">{t('common.title')} *</label>
            <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div><label className="text-sm font-medium mb-1 block">{t('common.type')}</label>
            <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm">
              <option value="meeting">{t('calendar.meeting')}</option>
              <option value="showing">{t('calendar.showing')}</option>
              <option value="call">{t('calendar.call')}</option>
              <option value="other">{t('calendar.other')}</option>
            </select>
          </div>
          <div><label className="text-sm font-medium mb-1 block">{t('calendar.dateTime')}</label>
            <input type="datetime-local" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-muted">{t('common.cancel')}</button>
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
