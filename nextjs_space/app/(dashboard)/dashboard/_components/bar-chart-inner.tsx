'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-xl px-3 py-2 shadow-lg">
        <p className="text-xs font-medium text-foreground">{label}</p>
        <p className="text-sm font-bold" style={{ color: payload[0]?.payload?.fill }}>{payload[0]?.value}</p>
      </div>
    );
  }
  return null;
};

function CustomXTick({ x, y, payload }: any) {
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0} y={0} dy={4}
        textAnchor="end"
        transform="rotate(-40)"
        className="fill-muted-foreground text-[11px]"
        style={{ fontSize: 11 }}
      >
        {payload.value}
      </text>
    </g>
  );
}

function CustomYTick({ x, y, payload }: any) {
  return (
    <text
      x={x} y={y}
      textAnchor="end"
      dominantBaseline="central"
      className="fill-muted-foreground text-[11px]"
      style={{ fontSize: 11 }}
    >
      {payload.value}
    </text>
  );
}

export default function BarChartInner({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data ?? []} margin={{ top: 5, right: 5, bottom: 60, left: 0 }}>
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tick={<CustomXTick />}
          interval={0}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={<CustomYTick />}
          allowDecimals={false}
          width={30}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.3, radius: 8 }} />
        <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={40}>
          {(data ?? []).map((entry: any, idx: number) => (
            <Cell key={idx} fill={entry?.fill ?? '#5AC8FA'} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
