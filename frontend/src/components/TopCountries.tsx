'use client';

import { useRouter } from 'next/navigation';
import type { TopEntry } from '@/lib/api';
import { formatPrice } from '@/lib/currency';
import FlagImage from './FlagImage';

interface Props {
  cheapest: TopEntry[];
  expensive: TopEntry[];
  fuel: 'gasoline' | 'diesel';
  currency: string;
}

function RankItem({
  entry, rank, mode, currency,
}: { entry: TopEntry; rank: number; mode: 'cheap' | 'exp'; currency: string }) {
  const router = useRouter();
  const isExp = mode === 'exp';
  const priceColor = isExp ? 'var(--danger)' : 'var(--success)';

  const bgColor = isExp ? 'rgba(248, 113, 113, 0.08)' : 'rgba(46, 91, 255, 0.08)';
  const hoverColor = isExp ? 'rgba(248, 113, 113, 0.15)' : 'rgba(46, 91, 255, 0.15)';

  return (
    <button
      onClick={() => router.push(`/country/${encodeURIComponent(entry.country)}`)}
      className="rank-item w-full text-left"
      style={{
        background: bgColor,
        transition: 'background 0.2s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = hoverColor)}
      onMouseLeave={(e) => (e.currentTarget.style.background = bgColor)}
    >
      <span className="rank-num">{rank}</span>
      <FlagImage
        countryName={entry.country}
        countryCode={entry.country_code}
        size={22}
        className="mr-3"
      />
      <span className="flex-1 text-sm font-medium" style={{ color: 'var(--on-surface)' }}>
        {entry.country}
      </span>
      <span className="rank-price" style={{ color: priceColor }}>
        {formatPrice(entry.price, currency)}<span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--on-dim)', marginLeft: '2px' }}>/L</span>
      </span>
    </button>
  );
}

export default function TopCountries({ cheapest, expensive, fuel, currency }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

      {/* Les Moins Chers */}
      <div className="surface-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 10px var(--success)' }} />
          <span className="label-md" style={{ color: 'var(--on-surface-variant)' }}>Top 5 les Moins Chers</span>
        </div>
        <div className="flex flex-col gap-1">
          {cheapest.map((c, i) => (
            <RankItem key={c.country} entry={c} rank={i + 1} mode="cheap" currency={currency} />
          ))}
        </div>
      </div>

      {/* Les Plus Chers */}
      <div className="surface-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)', boxShadow: '0 0 10px var(--danger)' }} />
          <span className="label-md" style={{ color: 'var(--on-surface-variant)' }}>Top 5 les Plus Chers</span>
        </div>
        <div className="flex flex-col gap-1">
          {expensive.map((c, i) => (
            <RankItem key={c.country} entry={c} rank={i + 1} mode="exp" currency={currency} />
          ))}
        </div>
      </div>

    </div>
  );
}
