'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ConversionChart({ data }: { data: any[] }) {
  if ((data?.length ?? 0) === 0) {
    return <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">Немає даних</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data ?? []} margin={{ top: 5, right: 5, bottom: 60, left: 5 }}>
        <XAxis dataKey="name" tickLine={false} tick={{ fontSize: 9 }} angle={-45} textAnchor="end" interval={0} />
        <YAxis tickLine={false} tick={{ fontSize: 10 }} allowDecimals={false} />
        <Tooltip contentStyle={{ fontSize: 11 }} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {(data ?? []).map((e: any, i: number) => <Cell key={i} fill={e?.fill ?? '#60B5FF'} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
