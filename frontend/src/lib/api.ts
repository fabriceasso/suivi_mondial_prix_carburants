// Aides à la récupération de données partagées réutilisées à travers les pages

export interface CountryPrice {
  country: string;
  country_code: string | null;
  gasoline: number | null;
  diesel: number | null;
  scraped_at: string;
}

export interface PricesResponse {
  data: CountryPrice[];
  date: string;
  avg: number;
}

export interface TopEntry {
  country: string;
  country_code: string | null;
  price: number;
}

export interface TopResponse {
  cheapest: TopEntry[];
  expensive: TopEntry[];
  date: string;
  fuel: string;
}

export interface CountryDetail {
  country: string;
  country_code: string | null;
  latest: { scraped_at: string; gasoline: number | null; diesel: number | null };
  previous: { scraped_at: string; gasoline: number | null; diesel: number | null } | null;
  history: { scraped_at: string; gasoline: number | null; diesel: number | null }[];
  global_avg: { gasoline: number; diesel: number };
}

const BASE = process.env.NEXT_PUBLIC_API_URL || '';

export async function fetchPrices(fuel: 'gasoline' | 'diesel' = 'gasoline'): Promise<PricesResponse> {
  const res = await fetch(`${BASE}/api/prices?fuel=${fuel}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Échec de la récupération des prix');
  return res.json();
}

export async function fetchTop(fuel: 'gasoline' | 'diesel' = 'gasoline'): Promise<TopResponse> {
  const res = await fetch(`${BASE}/api/top?fuel=${fuel}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Échec de la récupération du top');
  return res.json();
}

export async function fetchCountry(country: string): Promise<CountryDetail> {
  const res = await fetch(`${BASE}/api/prices/${encodeURIComponent(country)}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error('Pays non trouvé');
  return res.json();
}

export function fmt(v: number | null | undefined): string {
  if (v == null) return 'N/A';
  return `$${v.toFixed(3)}`;
}

export function pctChange(current: number | null, previous: number | null): number | null {
  if (!current || !previous || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}
