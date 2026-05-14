export const ROOM_COLORS: Record<number, { label: string; gradient: string; solid: string }> = {
  0: { label: 'Studio', gradient: 'from-[#073B34] to-emerald-700', solid: '#073B34' },
  1: { label: '1', gradient: 'from-sky-400 to-sky-600', solid: '#38BDF8' },
  2: { label: '2', gradient: 'from-emerald-400 to-emerald-600', solid: '#34D399' },
  3: { label: '3', gradient: 'from-amber-400 to-amber-600', solid: '#FBBF24' },
  4: { label: '4', gradient: 'from-rose-400 to-rose-600', solid: '#FB7185' },
  5: { label: '5+', gradient: 'from-teal-400 to-teal-600', solid: '#2DD4BF' },
};

export const STATUS_STYLES: Record<string, { gradient: string; solid: string; ring: string; bgTint: string }> = {
  available: { gradient: 'from-emerald-400 to-green-500', solid: '#22C55E', ring: 'ring-emerald-500', bgTint: 'bg-emerald-500' },
  reserved: { gradient: 'from-amber-400 to-orange-500', solid: '#F59E0B', ring: 'ring-amber-500', bgTint: 'bg-amber-500' },
  sold: { gradient: 'from-rose-400 to-red-500', solid: '#EF4444', ring: 'ring-red-500', bgTint: 'bg-red-500' },
  unavailable: { gradient: 'from-gray-300 to-gray-400', solid: '#9CA3AF', ring: 'ring-gray-400', bgTint: 'bg-gray-400' },
};

export function getRoomColor(rooms: number | null) {
  const roomCount = rooms ?? 1;
  return ROOM_COLORS[Math.min(roomCount, 5)] || ROOM_COLORS[1];
}
