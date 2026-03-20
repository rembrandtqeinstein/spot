import { useState, useCallback, useRef } from 'react';
import { SpotLocation } from '../types';

export type PhotonFeature = {
  geometry: { coordinates: [number, number] }; // [lng, lat]
  properties: {
    osm_id: number;
    name?: string;
    street?: string;
    housenumber?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
    osm_key?: string;   // e.g. "amenity", "highway"
    osm_value?: string; // e.g. "restaurant", "cafe"
  };
};

// Human-readable category labels from Photon's osm_value
const CATEGORY_LABELS: Record<string, string> = {
  restaurant: '🍽 Restaurant', cafe: '☕ Café', bar: '🍺 Bar',
  fast_food: '🍔 Fast food', food_court: '🍱 Food court',
  pub: '🍻 Pub', bakery: '🥐 Bakery', ice_cream: '🍦 Ice cream',
  hotel: '🏨 Hotel', hostel: '🛏 Hostel', museum: '🏛 Museum',
  park: '🌳 Park', stadium: '🏟 Stadium', theatre: '🎭 Theatre',
  cinema: '🎬 Cinema', gym: '💪 Gym', hospital: '🏥 Hospital',
  pharmacy: '💊 Pharmacy', school: '🏫 School', university: '🎓 University',
  supermarket: '🛒 Supermarket', mall: '🛍 Mall', shop: '🏪 Shop',
  airport: '✈️ Airport', station: '🚉 Station', bus_stop: '🚌 Bus stop',
};

function formatLabel(f: PhotonFeature): { primary: string; secondary: string; category?: string } {
  const p = f.properties;
  const parts: string[] = [];
  if (p.street) parts.push(p.housenumber ? `${p.street} ${p.housenumber}` : p.street);
  if (p.city) parts.push(p.city);
  if (p.state) parts.push(p.state);
  if (p.country) parts.push(p.country);

  return {
    primary: p.name || parts[0] || 'Unknown',
    secondary: p.name ? parts.join(', ') : parts.slice(1).join(', '),
    category: p.osm_value ? CATEGORY_LABELS[p.osm_value] : undefined,
  };
}

export function featureToSpotLocation(f: PhotonFeature): SpotLocation {
  const [lng, lat] = f.geometry.coordinates;
  const p = f.properties;
  const parts: string[] = [];
  if (p.name) parts.push(p.name);
  if (p.street) parts.push(p.housenumber ? `${p.street} ${p.housenumber}` : p.street);
  if (p.city) parts.push(p.city);
  if (p.state) parts.push(p.state);
  if (p.country) parts.push(p.country);
  return { lat, lng, address: parts.join(', ') || 'Unknown location' };
}

export function useLocationSearch() {
  const [results, setResults] = useState<PhotonFeature[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((query: string, userLat?: number, userLng?: number) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); return; }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const params = new URLSearchParams({ q: query, limit: '7', lang: 'en' });
        // Bias results toward user's location if available
        if (userLat !== undefined && userLng !== undefined) {
          params.set('lat', String(userLat));
          params.set('lon', String(userLng));
        }
        const res = await fetch(`https://photon.komoot.io/api/?${params}`);
        const data = await res.json();
        setResults(data.features ?? []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
  }, []);

  const clear = useCallback(() => {
    setResults([]);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  return { results, searching, search, clear, formatLabel, featureToSpotLocation };
}
