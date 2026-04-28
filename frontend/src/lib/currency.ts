export const CURRENCY_RATES: Record<string, { rate: number, symbol: string, pos: 'left' | 'right', frac: number }> = {
  USD: { rate: 1, symbol: '$', pos: 'left', frac: 3 },
  EUR: { rate: 0.92, symbol: '€', pos: 'right', frac: 3 },
  XOF: { rate: 605, symbol: ' FCFA', pos: 'right', frac: 0 },
  CAD: { rate: 1.36, symbol: 'CA$', pos: 'left', frac: 3 },
  CHF: { rate: 0.91, symbol: 'CHF ', pos: 'left', frac: 3 },
};

export function formatPrice(usdPrice: number | null | undefined, currency: string) {
  if (usdPrice == null) return '—';
  const c = CURRENCY_RATES[currency] || CURRENCY_RATES.USD;
  const converted = usdPrice * c.rate;
  const val = converted.toFixed(c.frac);
  return c.pos === 'left' ? `${c.symbol}${val}` : `${val}${c.symbol}`;
}
