'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import FlagImage from '@/components/FlagImage';
import type { CountryDetail } from '@/lib/api';
import { CURRENCY_RATES, formatPrice } from '@/lib/currency';

function DeltaBadge({ current, previous }: { current: number | null; previous: number | null }) {
  if (!current || !previous) {
    return <span className="chip chip-neutral">— Pas de variation</span>;
  }
  const pct = ((current - previous) / previous) * 100;
  const abs = Math.abs(pct).toFixed(2);
  if (Math.abs(pct) < 0.01) return <span className="chip chip-neutral">→ Inchangé</span>;
  if (pct > 0) return <span className="chip chip-danger">↑ +{abs}%</span>;
  return <span className="chip chip-success">↓ -{abs}%</span>;
}

function CompareBar({ value, avg, label, currency }: { value: number | null; avg: number; label: string; currency: string }) {
  if (!value) return null;
  const pct = Math.min((value / (avg * 2.5)) * 100, 100);
  const isAbove = value > avg;
  const barColor = isAbove ? 'var(--danger)' : 'var(--success)';
  const pctDiff = ((value / avg - 1) * 100).toFixed(1);

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="label-md" style={{ color: 'var(--on-surface-variant)' }}>{label}</span>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: barColor }}>
          {isAbove ? '+' : ''}{pctDiff}% vs moyenne mondiale
        </span>
      </div>
      <div style={{
        height: '6px',
        borderRadius: '9999px',
        background: 'var(--surface-highest)',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          borderRadius: '9999px',
          background: barColor,
          boxShadow: `0 0 12px ${barColor}66`,
          transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
        }} />
      </div>
      <div className="flex justify-between mt-1">
        <span style={{ fontSize: '0.625rem', color: 'var(--on-dim)' }}>{formatPrice(0, currency)}</span>
        <span style={{ fontSize: '0.625rem', color: 'var(--primary)', fontWeight: 600 }}>moy {formatPrice(avg, currency)}</span>
        <span style={{ fontSize: '0.625rem', color: 'var(--on-dim)' }}>{formatPrice(avg * 2.5, currency)}</span>
      </div>
    </div>
  );
}

export default function CountryPage() {
  const params = useParams();
  const router = useRouter();
  const countryName = decodeURIComponent(params.name as string);

  const [data, setData] = useState<CountryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [currency, setCurrencyState] = useState('USD');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fuel_currency');
      if (saved) setCurrencyState(saved);
    }
  }, []);
  const setCurrency = (c: string) => {
    setCurrencyState(c);
    localStorage.setItem('fuel_currency', c);
  };

  useEffect(() => {
    fetch(`/api/prices/${encodeURIComponent(countryName)}`)
      .then(r => { if (!r.ok) throw new Error('Not found'); return r.json(); })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [countryName]);

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', paddingTop: '4rem', background: 'var(--surface-lowest)' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => router.back()}
              className="btn-ghost fade-up"
              style={{ fontSize: '0.8125rem' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              Retour aux pays
            </button>
            <select 
              value={currency} 
              onChange={e => setCurrency(e.target.value)}
              className="fade-up"
              style={{
                background: 'var(--surface-container)',
                color: 'var(--on-surface)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '99px',
                padding: '8px 16px',
                fontSize: '0.875rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {Object.keys(CURRENCY_RATES).map(cur => (
                <option key={cur} value={cur}>{cur}</option>
              ))}
            </select>
          </div>

          {loading && <LoadingSkeleton />}

          {error && (
            <div style={{
              background: 'var(--surface-container)',
              borderRadius: '1.25rem',
              padding: '4rem',
              textAlign: 'center',
              maxWidth: '32rem',
              margin: '0 auto',
            }}>
              <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏳️</p>
              <h1 className="title-lg" style={{ color: 'var(--on-surface)', marginBottom: '0.5rem' }}>
                Pays Introuvable
              </h1>
              <p className="body-md" style={{ color: 'var(--on-surface-variant)', marginBottom: '1.5rem' }}>
                Le pays « {countryName} » n'a pas encore été indexé.
              </p>
              <button onClick={() => router.push('/')} className="btn-primary">
                Retour au Dashboard
              </button>
            </div>
          )}

          {data && !loading && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* ── Left Column ── */}
              <div className="lg:col-span-1 flex flex-col gap-5">

                {/* Identity card */}
                <div className="fade-up" style={{
                  background: 'var(--surface-container)',
                  borderRadius: '1.25rem',
                  padding: '2rem',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '5rem', lineHeight: 1, marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                    <FlagImage
                      countryName={data.country}
                      countryCode={data.country_code}
                      size={80}
                    />
                  </div>
                  <h1 style={{
                    fontSize: '1.625rem', fontWeight: 800,
                    letterSpacing: '-0.02em', color: 'var(--on-surface)',
                    marginBottom: '0.5rem',
                  }}>
                    {data.country}
                  </h1>
                  <span className="chip chip-neutral">{data.country_code} · Pays Actif</span>
                </div>

                {/* Price cards */}
                <div className="fade-up-1" style={{
                  background: 'var(--surface-container)',
                  borderRadius: '1.25rem',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                }}>
                  <PriceIndexCard
                    label="Index Essence"
                    value={data.latest.gasoline}
                    avg={data.global_avg.gasoline}
                    accentColor="var(--primary-container)"
                    currency={currency}
                  />
                  <div style={{ height: '1px', background: 'var(--surface-high)' }} />
                  <PriceIndexCard
                    label="Index Diesel"
                    value={data.latest.diesel}
                    avg={data.global_avg.diesel}
                    accentColor="#f59e0b"
                    currency={currency}
                  />
                </div>

                {/* Compare vs global avg */}
                <div className="fade-up-2" style={{
                  background: 'var(--surface-container)',
                  borderRadius: '1.25rem',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                }}>
                  <p className="label-md" style={{ color: 'var(--on-surface-variant)', marginBottom: '0.25rem' }}>
                    Performances vs Moyennes
                  </p>
                  <CompareBar value={data.latest.gasoline} avg={data.global_avg.gasoline} label="Essence" currency={currency} />
                  <CompareBar value={data.latest.diesel} avg={data.global_avg.diesel} label="Diesel" currency={currency} />
                </div>
              </div>

              {/* ── Right Column: Chart ── */}
              <div className="lg:col-span-2 fade-up-1">
                <div style={{
                  background: 'var(--surface-container)',
                  borderRadius: '1.25rem',
                  padding: '2rem',
                  height: '100%',
                }}>
                  <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
                    <div>
                      <h2 className="title-lg" style={{ color: 'var(--on-surface)', marginBottom: '0.25rem' }}>
                        Trajectoire du Pays
                      </h2>
                      <p className="label-md" style={{ color: 'var(--on-surface-variant)' }}>
                        Évolution sur la période d'indexation active
                      </p>
                    </div>
                    <DeltaBadge
                      current={data.latest.gasoline}
                      previous={data.previous?.gasoline ?? null}
                    />
                  </div>

                  <PriceChart history={data.history} globalAvg={data.global_avg} currency={currency} />

                  <div
                    className="flex items-center justify-between mt-6 pt-5"
                    style={{ borderTop: '1px solid rgba(67,70,86,0.3)' }}
                  >
                    <div>
                      <p className="label-sm" style={{ color: 'var(--on-dim)', marginBottom: '0.25rem' }}>Dernière Entrée</p>
                      <p style={{ color: 'var(--on-surface)', fontWeight: 600, fontFamily: 'monospace', fontSize: '0.875rem' }}>
                        {data.latest.scraped_at}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p className="label-sm" style={{ color: 'var(--on-dim)', marginBottom: '0.25rem' }}>Source</p>
                      <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem' }}>
                        GPP Analytics
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </main>
    </>
  );
}

function PriceIndexCard({
  label, value, avg, accentColor, currency
}: { label: string; value: number | null; avg: number; accentColor: string; currency: string }) {
  const isAbove = value != null && value > avg;
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="label-md" style={{ color: 'var(--on-surface-variant)', marginBottom: '0.25rem' }}>{label}</p>
        <p style={{
          fontSize: '1.75rem', fontWeight: 800,
          fontFamily: 'monospace',
          letterSpacing: '-0.03em',
          color: 'var(--on-surface)',
        }}>
          {value != null ? formatPrice(value, currency) : '—'}
          <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--on-dim)', marginLeft: '4px' }}>/L</span>
        </p>
      </div>
      <div style={{ textAlign: 'right' }}>
        <span style={{
          display: 'inline-block',
          width: '4px',
          height: '40px',
          borderRadius: '9999px',
          background: accentColor,
          opacity: 0.8,
        }} />
        {value != null && (
          <p style={{
            fontSize: '0.6875rem', fontWeight: 700,
            color: isAbove ? 'var(--danger)' : 'var(--success)',
            marginTop: '0.25rem',
          }}>
            {isAbove ? '▲' : '▼'} {Math.abs(((value / avg) - 1) * 100).toFixed(1)}%
          </p>
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
      <div className="lg:col-span-1 flex flex-col gap-5">
        <div className="skeleton h-56 rounded-2xl" />
        <div className="skeleton h-40 rounded-2xl" />
        <div className="skeleton h-32 rounded-2xl" />
      </div>
      <div className="lg:col-span-2">
        <div className="skeleton h-[480px] rounded-2xl" />
      </div>
    </div>
  );
}

const PriceChart = dynamic(() => import('@/components/PriceChart'), {
  ssr: false,
  loading: () => <div className="skeleton h-64 rounded-2xl" />,
});
