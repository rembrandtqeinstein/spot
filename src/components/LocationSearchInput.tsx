import { useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { useLocationSearch } from '../hooks/useLocationSearch';
import { SpotLocation } from '../types';

type Props = {
  value: SpotLocation | null;
  onChange: (loc: SpotLocation) => void;
  error?: string;
};

export function LocationSearchInput({ value, onChange, error }: Props) {
  const [query, setQuery] = useState(value?.address ?? '');
  const [open, setOpen] = useState(false);
  const { results, searching, search, clear, toSpotLocation } = useLocationSearch();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setOpen(true);
    search(e.target.value);
  };

  const handleSelect = (result: (typeof results)[number]) => {
    const loc = toSpotLocation(result);
    onChange(loc);
    setQuery(result.display_name.split(',').slice(0, 3).join(','));
    setOpen(false);
    clear();
  };

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => query && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder="Search location..."
          className={`w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
            error ? 'border-red-400' : 'border-gray-300'
          }`}
        />
        {searching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-auto">
          {results.map((r) => (
            <li
              key={r.place_id}
              onMouseDown={() => handleSelect(r)}
              className="px-3 py-2 text-sm text-gray-700 hover:bg-brand-50 cursor-pointer"
            >
              {r.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
