'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { CountryPrice } from '@/lib/api';
import { formatPrice } from '@/lib/currency';

interface Props {
  data: CountryPrice[];
  fuel: 'gasoline' | 'diesel';
  currency: string;
}

// Échelle de couleurs : bleu profond (bon marché) → violet → rouge vif (cher)
function priceToColor(price: number, min: number, max: number): string {
  // On utilise une courbe non-linéaire (puissance 0.55) pour "pousser" plus rapidement vers le rouge,
  // car quelques valeurs très élevées écrasaient la majorité des pays dans le bleu.
  const rawT = Math.max(0, Math.min(1, (price - min) / (max - min)));
  const t = Math.pow(rawT, 0.55); 
  
  // bleu profond #1E3A8A → violet #7C3AED → rouge vif #EF4444
  if (t < 0.5) {
    // bleu profond → violet
    const f = t * 2;
    const r = Math.round(30 + (124 - 30) * f);
    const g = Math.round(58 + (58 - 58) * f);
    const b = Math.round(138 + (237 - 138) * f);
    return `rgb(${r},${g},${b})`;
  } else {
    // violet → rouge vif
    const f = (t - 0.5) * 2;
    const r = Math.round(124 + (239 - 124) * f);
    const g = Math.round(58 + (68 - 58) * f);
    const b = Math.round(237 + (68 - 237) * f);
    return `rgb(${r},${g},${b})`;
  }
}

export default function WorldMap({ data, fuel, currency }: Props) {
  const router = useRouter();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [geoData, setGeoData] = useState<any>(null);
  const [tooltip, setTooltip] = useState<{
    country: string; price: string; x: number; y: number;
  } | null>(null);

  const validPricesArray = useMemo(() => data.map((d) => (fuel === 'diesel' ? d.diesel : d.gasoline) ?? 0).filter((p) => p > 0), [data, fuel]);

  const minP = useMemo(() => validPricesArray.length > 0 ? Math.min(...validPricesArray) : 0.5, [validPricesArray]);
  const maxP = useMemo(() => validPricesArray.length > 0 ? Math.max(...validPricesArray) : 2.5, [validPricesArray]);
  
  const mappedPriceData = useMemo(() => {
    const m = new Map();
    data.forEach(d => {
      if (d.country_code) m.set(d.country_code.toUpperCase(), d);
      m.set(d.country.toLowerCase(), d);
    });
    return m;
  }, [data]);

  // Initialisation de la carte (une seule fois)
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let map: any;
    const init = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      if (!mapContainerRef.current || mapRef.current) return;

      map = L.map(mapContainerRef.current, {
        center: [20, 0],
        zoom: 2,
        zoomControl: true,
        scrollWheelZoom: true,
        attributionControl: false,
        worldCopyJump: true,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
      setReady(true);
    };

    init();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        setReady(false);
      }
    };
  }, []);

  // Chargement UNIQUE du GeoJSON
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
      .then(res => res.json())
      .then(setGeoData)
      .catch(err => console.error('GeoJSON Load Error:', err));
  }, []);

  // Peinture des pays (réactive au changement de fuel ou de données)
  const paintCountries = useCallback(async () => {
    if (!mapRef.current || !ready || !geoData) return;
    const L = (await import('leaflet')).default;

    if (layerRef.current) {
      layerRef.current.remove();
      layerRef.current = null;
    }

    layerRef.current = L.geoJSON(geoData, {
      style: (feature: any) => {
        const props = feature?.properties || {};
        const code2 = (props['ISO3166-1-Alpha-2'] || props.ISO_A2 || props.iso_a2 || props.ISO2 || "").toUpperCase();
        const code3 = (props['ISO3166-1-Alpha-3'] || props.ISO_A3 || props.iso_a3 || props.GU_A3 || "").toUpperCase();
        const name = (props.ADMIN || props.name || "").toLowerCase();
        
        const entry = mappedPriceData.get(code3) || mappedPriceData.get(code2) || mappedPriceData.get(name);
        const price = entry ? (fuel === 'diesel' ? entry.diesel : entry.gasoline) : null;

        if (!price) {
          return {
            fillColor: 'rgba(255,255,255,0.05)',
            weight: 0.5,
            color: 'rgba(67, 70, 86, 0.4)',
            fillOpacity: 0.6
          };
        }
        
        return {
          fillColor: priceToColor(price, minP, maxP),
          weight: 0.5,
          color: 'rgba(10, 14, 26, 0.5)',
          fillOpacity: 0.85,
        };
      },
      onEachFeature: (feature: any, layer: any) => {
        const props = feature?.properties || {};
        const code2 = (props['ISO3166-1-Alpha-2'] || props.ISO_A2 || props.iso_a2 || "").toUpperCase();
        const code3 = (props['ISO3166-1-Alpha-3'] || props.ISO_A3 || props.iso_a3 || "").toUpperCase();
        const rawName = props.ADMIN || props.name || 'Inconnu';
        
        const entry = mappedPriceData.get(code3) || mappedPriceData.get(code2) || mappedPriceData.get(rawName.toLowerCase());
        const price = entry ? (fuel === 'diesel' ? entry.diesel : entry.gasoline) : null;
        const displayName = entry ? entry.country : rawName;

        layer.on({
          mouseover: (e: any) => {
            e.target.setStyle({ weight: 1.5, color: 'var(--primary)', fillOpacity: 0.95 });
            e.target.bringToFront();
            const point = mapRef.current?.latLngToContainerPoint(e.latlng);
            if (point) {
              setTooltip({
                country: displayName,
                price: price ? `${formatPrice(price, currency)}/L` : 'Données non disponibles',
                x: point.x,
                y: point.y,
              });
            }
          },
          mousemove: (e: any) => {
            const point = mapRef.current?.latLngToContainerPoint(e.latlng);
            if (point) {
              setTooltip(t => t ? { ...t, x: point.x, y: point.y } : null);
            }
          },
          mouseout: (e: any) => {
            layerRef.current?.resetStyle(e.target);
            setTooltip(null);
          },
          click: () => {
            if (entry) router.push(`/country/${encodeURIComponent(entry.country)}`);
          },
        });
      },
    }).addTo(mapRef.current);
  }, [ready, geoData, fuel, minP, maxP, router, mappedPriceData, currency]);

  useEffect(() => {
    paintCountries();
  }, [paintCountries]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden" style={{ height: 460, zIndex: 1 }}>
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Info-bulle */}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-[1000] glass px-3 py-2 text-sm transition-all"
          style={{ 
            left: tooltip.x + 15, 
            top: tooltip.y - 45,
            transform: 'translate3d(0,0,0)' 
          }}
        >
          <p className="font-semibold text-white whitespace-nowrap">{tooltip.country}</p>
          <p className="text-blue-400 font-mono">{tooltip.price}</p>
        </div>
      )}

      {/* Légende des couleurs */}
      <div className="absolute bottom-4 right-4 glass px-3 py-2 text-xs z-[1000]">
        <p className="text-slate-400 mb-1 font-medium">Prix / Litre (USD)</p>
        <div className="flex items-center gap-2">
          <span className="font-mono" style={{ color: '#60A5FA' }}>${minP.toFixed(2)}</span>
          <div className="w-24 h-2 rounded-full" style={{
            background: 'linear-gradient(to right, #1E3A8A, #7C3AED, #EF4444)'
          }} />
          <span className="font-mono" style={{ color: '#F87171' }}>${maxP.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
