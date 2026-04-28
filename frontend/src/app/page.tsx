'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import FuelToggle from '@/components/FuelToggle';
import TopCountries from '@/components/TopCountries';
import FlagImage from '@/components/FlagImage';
import type { PricesResponse, TopResponse } from '@/lib/api';
import { CURRENCY_RATES, formatPrice } from '@/lib/currency';

export default function HomePage() {
  const [fuel, setFuel] = useState<'gasoline' | 'diesel'>('gasoline');
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

  const [prices, setPrices] = useState<PricesResponse | null>(null);
  const [top, setTop] = useState<TopResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (f: 'gasoline' | 'diesel') => {
    setLoading(true);
    try {
      const [pRes, tRes] = await Promise.all([
        fetch(`/api/prices?fuel=${f}`).then(r => r.json()),
        fetch(`/api/top?fuel=${f}`).then(r => r.json()),
      ]);
      setPrices(pRes);
      setTop(tRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(fuel); }, [fuel, load]);

  const WorldMap = dynamic(() => import('@/components/WorldMap'), {
    ssr: false,
    loading: () => (
      <div
        className="w-full h-full rounded-2xl flex items-center justify-center skeleton"
        style={{ minHeight: 440 }}
      >
        <span className="label-md" style={{ color: 'var(--on-dim)' }}>Chargement de la carte…</span>
      </div>
    ),
  });

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', paddingTop: '4rem', background: 'var(--surface-lowest)' }}>

        {/* ── Hero ── */}
        <section style={{ padding: '2rem 1.5rem 1.5rem' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto' }}>

            {/* Badge */}
            <div className="fade-up flex justify-center mb-6">
              <div
                className="inline-flex items-center gap-2"
                style={{
                  background: 'var(--surface-container)',
                  borderRadius: '9999px',
                  padding: '0.375rem 1rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: 'var(--on-surface-variant)',
                }}
              >
                <span className="live-dot" />
                Analyse en Temps Réel · Source : GlobalPetrolPrices
              </div>
            </div>

            {/* Headline */}
            <div className="fade-up-1 text-center mb-8">
              <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: '0.75rem' }}>
                <span style={{ color: 'var(--on-surface)' }}>Suivi des Prix du</span>{' '}
                <span className="gradient-text">Carburant</span>
              </h1>
              <p className="body-md" style={{ color: 'var(--on-surface-variant)', maxWidth: '36rem', margin: '0 auto' }}>
                Terminal de données pour la surveillance des fluctuations des prix de l'éssence et du gasoil à l'échelle mondiale.
              </p>
            </div>

            {/* Metric Cards - Forcing 1 row to save space */}
            <div className="fade-up-2 grid grid-cols-3 gap-2 mb-6 overflow-x-auto pb-2">
              <MetricCard
                label="Indice mondial des prix des carburants"
                value={loading ? '...' : formatPrice(prices?.avg, currency)}
                sub={`Moyenne · ${fuel === 'gasoline' ? 'Essence' : 'Diesel'}`}
                trend="+1.4% vs par rapport à l'ancien indice"
                loading={loading}
              />
              <MetricCard
                label="Pays Surveillés"
                value={loading ? '...' : String(prices?.data?.length ?? 0)}
                sub="Pays et territoires"
                loading={loading}
              />
              <MetricCard
                label="Dernière Mise à Jour"
                value={loading ? '...' : (prices?.date ?? '—')}
                sub="Scraping quotidien"
                loading={loading}
              />
            </div>

            {/* Controls (Fuel Toggle & Currency) */}
            <div className="fade-up-3 flex flex-wrap justify-center items-center gap-4 mb-8">
              <FuelToggle value={fuel} onChange={setFuel} />
              
              <select 
                value={currency} 
                onChange={e => setCurrency(e.target.value)}
                style={{
                  background: 'var(--surface-container)',
                  color: 'var(--on-surface)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '99px',
                  padding: '10px 16px',
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

          </div>
        </section>

        {/* ── World Map ── */}
        <section style={{ padding: '0 1.5rem 2.5rem' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
            <div
              className="fade-up-3"
              style={{
                background: 'var(--surface-container)',
                borderRadius: '1.25rem',
                padding: '0.5rem',
                minHeight: '460px',
              }}
            >
              {!loading && prices?.data ? (
                <WorldMap data={prices.data} fuel={fuel} currency={currency} />
              ) : (
                <div className="skeleton rounded-xl" style={{ minHeight: 440 }} />
              )}
            </div>
            <p className="label-sm text-center mt-3" style={{ color: 'var(--on-dim)' }}>
              Survoler pour prévisualiser · Cliquez pour explorer les détails du pays
            </p>
          </div>
        </section>

        {/* ── Rankings ── */}
        <section style={{ padding: '0 1.5rem 2.5rem' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
            <div className="flex items-baseline gap-3 mb-5">
              <h2 className="title-lg fade-up" style={{ color: 'var(--on-surface)' }}>Classement des Pays</h2>
              <span className="label-md fade-up" style={{ color: 'var(--on-surface-variant)' }}>
                — {fuel === 'gasoline' ? 'Essence' : 'Diesel'}
              </span>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="skeleton h-48 rounded-2xl" />
                <div className="skeleton h-48 rounded-2xl" />
              </div>
            ) : top ? (
              <TopCountries cheapest={top.cheapest} expensive={top.expensive} fuel={fuel} currency={currency} />
            ) : null}
          </div>
        </section>

        {/* ── All Countries Table ── */}
        <section style={{ padding: '0 1.5rem 5rem' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
            <div className="flex items-baseline gap-3 mb-5">
              <h2 className="title-lg" style={{ color: 'var(--on-surface)' }}>Répertoire Complet</h2>
              {!loading && prices?.data && (
                <span className="label-md" style={{ color: 'var(--on-surface-variant)' }}>
                  — {prices.data.length} pays
                </span>
              )}
            </div>

            <div style={{ background: 'var(--surface-container)', borderRadius: '1.25rem', overflow: 'hidden' }}>
              <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ position: 'sticky', top: 0, zIndex: 2, background: 'var(--surface-low)' }}>Juridiction</th>
                      <th style={{ position: 'sticky', top: 0, zIndex: 2, background: 'var(--surface-low)', textAlign: 'right' }}>Essence</th>
                      <th style={{ position: 'sticky', top: 0, zIndex: 2, background: 'var(--surface-low)', textAlign: 'right' }}>Diesel</th>
                      <th style={{ position: 'sticky', top: 0, zIndex: 2, background: 'var(--surface-low)', textAlign: 'right' }}>vs Moy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading
                      ? Array.from({ length: 8 }).map((_, i) => (
                        <tr key={i} style={{ cursor: 'default' }}>
                          {[80, 60, 60, 50].map((w, j) => (
                            <td key={j}>
                              <div className="skeleton h-3.5 rounded" style={{ width: `${w}px`, ...(j > 0 ? { marginLeft: 'auto' } : {}) }} />
                            </td>
                          ))}
                        </tr>
                      ))
                      : prices?.data?.map((row) => {
                        const price = fuel === 'diesel' ? row.diesel : row.gasoline;
                        const diff = price != null && prices.avg ? price - prices.avg : null;
                        const isAbove = diff != null && diff > 0;
                        return (
                          <tr
                            key={row.country}
                            onClick={() => window.location.href = `/country/${encodeURIComponent(row.country)}`}
                          >
                            <td>
                              <div className="flex items-center">
                                <FlagImage
                                  countryName={row.country}
                                  countryCode={row.country_code}
                                  size={20}
                                  className="mr-3"
                                />
                                <span style={{ color: 'var(--on-surface)', fontWeight: 500 }}>{row.country}</span>
                              </div>
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 600, fontFamily: 'monospace', color: 'var(--primary)' }}>
                              {row.gasoline != null ? formatPrice(row.gasoline, currency) : '—'}
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 600, fontFamily: 'monospace', color: 'var(--secondary)' }}>
                              {row.diesel != null ? formatPrice(row.diesel, currency) : '—'}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              {diff != null ? (() => {
                                const rate = CURRENCY_RATES[currency]?.rate || 1;
                                const frac = CURRENCY_RATES[currency]?.frac ?? 3;
                                const convertedDiff = diff * rate;
                                return (
                                  <span className={`chip ${isAbove ? 'chip-danger' : 'chip-success'}`}>
                                    {isAbove ? '+' : ''}{convertedDiff.toFixed(frac)}
                                  </span>
                                );
                              })() : '—'}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer
          style={{
            padding: '1.5rem',
            textAlign: 'center',
            borderTop: '1px solid rgba(67,70,86,0.2)',
          }}
        >
          <p className="label-sm" style={{ color: 'var(--on-dim)' }}>
            © 2026  Fuel Price Tracker  ·  by nivaQuine · Source :{' '}
            <a href="https://www.globalpetrolprices.com" target="_blank" rel="noopener noreferrer"
              style={{ color: 'var(--primary)', textDecoration: 'none' }}>
              GlobalPetrolPrices.com
            </a>
            {' '}· 
          </p>
        </footer>

      </main>
    </>
  );
}

function MetricCard({
  label, value, sub, trend, loading,
}: { label: string; value: string; sub: string; trend?: string; loading: boolean }) {
  return (
    <div className="metric-card fade-up-1">
      <p className="metric-label">{label}</p>
      {loading
        ? <div className="skeleton h-9 w-32 rounded-lg mt-1 mb-2" />
        : <p className="metric-value">{value}</p>
      }
      <p className="metric-sub">{sub}</p>
      {trend && !loading && (
        <div className="mt-3">
          <span className="chip chip-success">{trend}</span>
        </div>
      )}
    </div>
  );
}
