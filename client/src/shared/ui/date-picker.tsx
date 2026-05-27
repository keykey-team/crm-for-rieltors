'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { useTranslation } from '@/shared/lib/i18n/context';

function isSameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

export function DatePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useTranslation();
  const monthNames = [
    t('calendar.january'), t('calendar.february'), t('calendar.march'),
    t('calendar.april'), t('calendar.may'), t('calendar.june'),
    t('calendar.july'), t('calendar.august'), t('calendar.september'),
    t('calendar.october'), t('calendar.november'), t('calendar.december'),
  ];
  const dayNames = [
    t('calendar.mon'), t('calendar.tue'), t('calendar.wed'),
    t('calendar.thu'), t('calendar.fri'), t('calendar.sat'), t('calendar.sun'),
  ];

  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => value ? new Date(`${value}T00:00`) : new Date());
  const ref = useRef<HTMLDivElement>(null);
  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };

    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (value) setViewDate(new Date(`${value}T00:00`));
  }, [value]);

  const selected = value ? new Date(`${value}T00:00`) : null;
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const startDay = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthLast = new Date(year, month, 0).getDate();

  const cells: { day: number; current: boolean; date: Date }[] = [];
  for (let index = startDay - 1; index >= 0; index -= 1) {
    cells.push({
      day: prevMonthLast - index,
      current: false,
      date: new Date(year, month - 1, prevMonthLast - index),
    });
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ day, current: true, date: new Date(year, month, day) });
  }
  const remaining = (7 - (cells.length % 7)) % 7;
  for (let day = 1; day <= remaining; day += 1) {
    cells.push({ day, current: false, date: new Date(year, month + 1, day) });
  }

  const displayValue = selected
    ? `${String(selected.getDate()).padStart(2, '0')}.${String(selected.getMonth() + 1).padStart(2, '0')}.${selected.getFullYear()}`
    : '';

  const selectDate = (date: Date) => {
    const normalized = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    onChange(normalized);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          'w-full flex items-center gap-2.5 pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-left transition bg-card',
          open ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50',
        )}
      >
        <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <span className={displayValue ? 'text-foreground' : 'text-muted-foreground'}>
          {displayValue || '—'}
        </span>
      </button>

      {open && (
        <div
          className="absolute z-50 top-full mt-1.5 left-0 bg-card rounded-2xl border border-border/50 p-3 w-64"
          style={{ boxShadow: 'var(--shadow-lg)' }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              className="p-1.5 rounded-lg hover:bg-muted transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-sm font-semibold">{monthNames[month]} {year}</span>
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              className="p-1.5 rounded-lg hover:bg-muted transition"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {dayNames.map((dayName) => (
              <div key={dayName} className="text-center text-[10px] font-semibold text-muted-foreground uppercase py-1">{dayName}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-0.5">
            {cells.map((cell, index) => {
              const selectedDay = selected && isSameDay(cell.date, selected);
              const todayCell = isSameDay(cell.date, today);

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectDate(cell.date)}
                  className={cn(
                    'h-7 w-full flex items-center justify-center rounded-lg text-xs font-medium transition',
                    selectedDay ? 'bg-primary text-primary-foreground' :
                    todayCell ? 'border border-primary/60 text-primary' :
                    cell.current ? 'text-foreground hover:bg-muted' :
                    'text-muted-foreground/50 hover:bg-muted/50',
                  )}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false); }}
              className="text-xs text-muted-foreground hover:text-foreground transition px-1"
            >
              {t('common.delete')}
            </button>
            <button
              type="button"
              onClick={() => selectDate(today)}
              className="text-xs text-primary hover:text-primary/80 font-medium transition px-1"
            >
              {t('calendar.today')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}