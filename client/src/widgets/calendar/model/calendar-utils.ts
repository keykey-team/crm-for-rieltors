export type ViewMode = 'month' | 'week' | 'day';

export const EVENT_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  meeting: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  showing: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  call: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  other: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
};

export function getMonday(date: Date): Date {
  const monday = new Date(date);
  const day = monday.getDay();
  const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}
