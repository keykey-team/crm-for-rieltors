'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function BarChartInner({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data ?? []} margin={{ top: 5, right: 5, bottom: 40, left: 5 }}>
        <XAxis dataKey="name" tickLine={false} tick={{ fontSize: 10 }} angle={-45} textAnchor="end" />
        <YAxis tickLine={false} tick={{ fontSize: 10 }} allowDecimals={false} />
        <Tooltip contentStyle={{ fontSize: 11 }} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {(data ?? []).map((entry: any, idx: number) => (
            <Cell key={idx} fill={entry?.fill ?? '#60B5FF'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
