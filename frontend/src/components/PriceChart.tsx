'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { formatPrice } from '@/lib/currency';

interface HistoryPoint {
  scraped_at: string;
  gasoline: number | null;
  diesel: number | null;
}

interface Props {
  history: HistoryPoint[];
  globalAvg: { gasoline: number; diesel: number };
  currency: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="ct-tooltip">
      <p className="label-sm mb-2" style={{ color: 'var(--on-surface-variant)' }}>{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center justify-between gap-6 mb-1">
          <div className="flex items-center gap-1.5">
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color }} />
            <span className="label-lg" style={{ color: 'var(--on-surface-variant)' }}>{entry.name}</span>
          </div>
          <span className="font-bold mono" style={{ color: 'var(--on-surface)', fontSize: '0.875rem' }}>
            {formatPrice(Number(entry.value), payload[0]?.payload?.currency || 'USD')}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function PriceChart({ history, globalAvg, currency }: Props) {
  const chartData = history.map((h) => ({
    date: h.scraped_at,
    Essence: h.gasoline ?? undefined,
    Diesel: h.diesel ?? undefined,
    currency,
  }));

  if (chartData.length < 2) {
    return (
      <div
        className="flex flex-col items-center justify-center h-48 rounded-2xl gap-3"
        style={{ background: 'var(--surface-low)' }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--outline)" strokeWidth="1.5"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
        <p className="label-md" style={{ color: 'var(--on-dim)' }}>
          Historique en cours de génération…
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--on-dim)' }}>
          Revenez après le prochain scraping quotidien
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="gradEssence" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#2e5bff" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#2e5bff" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradDiesel" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(67,70,86,0.3)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fill: '#8e90a2', fontSize: 11, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v.slice(5)}
          />
          <YAxis
            type="number"
            domain={['dataMin - 0.2', 'dataMax + 0.2']}
            tick={{ fill: '#8e90a2', fontSize: 11, fontWeight: 500 }}
            tickFormatter={(value) => formatPrice(value, currency)}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: 'rgba(67,70,86,0.4)', strokeWidth: 1 }}
          />

          <ReferenceLine
            y={globalAvg.gasoline}
            stroke="#60a5fa"
            strokeDasharray="5 4"
            strokeOpacity={0.35}
            label={{ value: 'MOY', fill: '#60a5fa', fontSize: 9, fontWeight: 700, position: 'insideBottomRight' }}
          />

          <Area
            type="monotone"
            dataKey="Essence"
            stroke="#2e5bff"
            strokeWidth={2.5}
            fill="url(#gradEssence)"
            dot={false}
            activeDot={{ r: 5, fill: '#2e5bff', strokeWidth: 0 }}
            connectNulls
          />
          <Area
            type="monotone"
            dataKey="Diesel"
            stroke="#f59e0b"
            strokeWidth={2.5}
            fill="url(#gradDiesel)"
            dot={false}
            activeDot={{ r: 5, fill: '#f59e0b', strokeWidth: 0 }}
            connectNulls
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
