import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, LocateFixed } from 'lucide-react';
import { useLocationSearch, featureToSpotLocation } from '../hooks/useLocationSearch';
import { SpotLocation } from '../types';

type Props = {
  value: SpotLocation | null;
  onChange: (loc: SpotLocation) => void;
  error?: string;
};

export function LocationSearchInput({ value, onChange, error }: Props) {
  const [query, setQuery] = useState(value?.address ?? '');
  const [open, setOpen] = useState(false);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const { results, searching, search, clear, formatLabel } = useLocationSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  // Get user location for result bias (silent, no prompt)
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (p) => setUserPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {}
    );
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setOpen(true);
    search(e.target.value, userPos?.lat, userPos?.lng);
  };

  const handleSelect = (feature: (typeof results)[number]) => {
    const loc = featureToSpotLocation(feature);
    onChange(loc);
    setQuery(loc.address);
    setOpen(false);
    clear();
  };

  const handleUseMyLocation = () => {
    navigator.geolocation?.getCurrentPosition((p) => {
      const loc: SpotLocation = {
        lat: p.coords.latitude,
        lng: p.coords.longitude,
        address: 'My current location',
      };
      // Reverse geocode with Photon
      fetch(`https://photon.komoot.io/reverse?lat=${loc.lat}&lon=${loc.lng}&limit=1&lang=en`)
        .then((r) => r.json())
        .then((data) => {
          const f = data.features?.[0];
          if (f) {
            const resolved = featureToSpotLocation(f);
            onChange(resolved);
            setQuery(resolved.address);
          } else {
            onChange(loc);
            setQuery(`${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}`);
          }
        })
        .catch(() => { onChange(loc); setQuery('My current location'); });
    });
  };

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => query && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search a place, restaurant, address…"
          className={`w-full pl-9 pr-20 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
            error ? 'border-red-400' : 'border-gray-300'
          }`}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {searching && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
          <button
            type="button"
            title="Use my location"
            onClick={handleUseMyLocation}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-brand-500 transition-colors"
          >
            <LocateFixed className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-auto">
          {results.map((r, i) => {
            const { primary, secondary, category } = formatLabel(r);
            return (
              <li
                key={`${r.properties.osm_id}-${i}`}
                onMouseDown={() => handleSelect(r)}
                className="px-3 py-2.5 hover:bg-brand-50 cursor-pointer border-b border-gray-50 last:border-0"
              >
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-medium text-gray-900 truncate">{primary}</span>
                      {category && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full shrink-0">
                          {category}
                        </span>
                      )}
                    </div>
                    {secondary && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">{secondary}</p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
