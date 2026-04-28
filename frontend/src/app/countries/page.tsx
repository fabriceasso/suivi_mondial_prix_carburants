'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import FuelToggle from '@/components/FuelToggle';
import FlagImage from '@/components/FlagImage';
import type { CountryPrice } from '@/lib/api';
import { CURRENCY_RATES, formatPrice } from '@/lib/currency';

export default function CountriesPage() {
  const router = useRouter();
  const [fuel, setFuel] = useState<'gasoline' | 'diesel'>('gasoline');
  const [data, setData] = useState<CountryPrice[]>([]);
  const [avg, setAvg] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  
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
    setLoading(true);
    fetch(`/api/prices?fuel=${fuel}`)
      .then(r => r.json())
      .then(d => { setData(d.data || []); setAvg(d.avg || 0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [fuel]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data
      .filter(r => r.country.toLowerCase().includes(q))
      .sort((a, b) => {
        const pa = (fuel === 'diesel' ? a.diesel : a.gasoline) ?? 0;
        const pb = (fuel === 'diesel' ? b.diesel : b.gasoline) ?? 0;
        return sortDir === 'asc' ? pa - pb : pb - pa;
      });
  }, [data, search, sortDir, fuel]);

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', paddingTop: '4rem', background: 'var(--surface-lowest)' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2.5rem 1.5rem 5rem' }}>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="fade-up" style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--on-surface)', marginBottom: '0.375rem' }}>
                Répertoire des Pays
              </h1>
              <p className="label-md fade-up-1" style={{ color: 'var(--on-surface-variant)' }}>
                {loading ? 'Chargement…' : `Index de ${filtered.length} pays · Moyenne mondiale : ${formatPrice(avg, currency)}/L`}
              </p>
            </div>
            <div className="fade-up-1 flex flex-wrap gap-4 items-center">
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

          {/* Search + Sort */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6 fade-up-2">
            {/* Search */}
            <div className="relative flex-1">
              <svg
                style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="var(--outline)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Rechercher un pays ou une juridiction…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--surface-container)',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '0.625rem 1rem 0.625rem 2.75rem',
                  fontSize: '0.875rem',
                  color: 'var(--on-surface)',
                  outline: 'none',
                  transition: 'box-shadow 0.2s ease',
                }}
                onFocus={e => (e.target.style.boxShadow = '0 0 0 2px var(--primary-container)')}
                onBlur={e => (e.target.style.boxShadow = 'none')}
              />
            </div>
            {/* Sort button */}
            <button
              onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
              className="btn-ghost"
              style={{ whiteSpace: 'nowrap' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M6 12h12M10 18h4"/></svg>
              {sortDir === 'asc' ? 'Prix Croissants' : 'Prix Décroissants'}
            </button>
          </div>

          {/* Table */}
          <div style={{ background: 'var(--surface-container)', borderRadius: '1.25rem', overflow: 'hidden' }} className="fade-up-3">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ background: 'var(--surface-low)' }}>Juridiction</th>
                  <th style={{ background: 'var(--surface-low)', textAlign: 'right' }}>Essence (/L)</th>
                  <th style={{ background: 'var(--surface-low)', textAlign: 'right' }}>Diesel (/L)</th>
                  <th style={{ background: 'var(--surface-low)', textAlign: 'right' }}>Écart vs Moyenne</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 12 }).map((_, i) => (
                    <tr key={i} style={{ cursor: 'default' }}>
                      {[120, 60, 60, 70].map((w, j) => (
                        <td key={j}>
                          <div className="skeleton h-3.5 rounded" style={{ width: `${w}px`, ...(j > 0 ? { marginLeft: 'auto' } : {}) }} />
                        </td>
                      ))}
                    </tr>
                  ))
                  : filtered.map((row) => {
                    const price = fuel === 'diesel' ? row.diesel : row.gasoline;
                    const diff = price != null ? price - avg : null;
                    const isAbove = diff != null && diff > 0;
                    return (
                      <tr
                        key={row.country}
                        onClick={() => router.push(`/country/${encodeURIComponent(row.country)}`)}
                      >
                        <td>
                          <div className="flex items-center">
                            <FlagImage
                              countryName={row.country}
                              countryCode={row.country_code}
                              size={22}
                              className="mr-3"
                            />
                            <span style={{ color: 'var(--on-surface)', fontWeight: 500, fontSize: '0.875rem' }}>{row.country}</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)', fontSize: '0.875rem' }}>
                          {row.gasoline != null ? formatPrice(row.gasoline, currency) : '—'}
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600, color: 'var(--secondary)', fontSize: '0.875rem' }}>
                          {row.diesel != null ? formatPrice(row.diesel, currency) : '—'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {diff != null ? (() => {
                            const diffVal = diff * (CURRENCY_RATES[currency]?.rate || 1);
                            const frac = CURRENCY_RATES[currency]?.frac ?? 3;
                            return (
                              <span className={`chip ${isAbove ? 'chip-danger' : 'chip-success'}`}>
                                {isAbove ? '+' : '−'}{Math.abs(diffVal).toFixed(frac)}
                              </span>
                            );
                          })() : <span style={{ color: 'var(--on-dim)' }}>—</span>}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>

            {!loading && filtered.length === 0 && (
              <div style={{ padding: '4rem', textAlign: 'center' }}>
                <p className="label-md" style={{ color: 'var(--on-dim)' }}>
                  Aucun résultat pour « {search} »
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
