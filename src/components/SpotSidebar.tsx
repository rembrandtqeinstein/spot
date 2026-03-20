import { Spot } from '../types';
import { formatDateTime, isSpotActive, isSpotUpcoming, isSpotExpired } from '../utils/time';
import { MapPin, Clock, User, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Props = {
  spots: Spot[];
  loading: boolean;
};

function StatusBadge({ spot }: { spot: Spot }) {
  if (isSpotActive(spot.start_time, spot.end_time)) {
    return <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full">Live</span>;
  }
  if (isSpotUpcoming(spot.start_time)) {
    return <span className="text-xs bg-blue-100 text-blue-700 font-medium px-2 py-0.5 rounded-full">Upcoming</span>;
  }
  return null;
}

export function SpotSidebar({ spots, loading }: Props) {
  const navigate = useNavigate();

  return (
    <aside className="w-full h-full flex flex-col bg-white border-r border-gray-200">
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-brand-500" />
          <h2 className="font-semibold text-gray-800 text-sm">Active Spots</h2>
          <span className="ml-auto bg-brand-100 text-brand-700 text-xs font-medium px-2 py-0.5 rounded-full">
            {spots.length}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-24 text-gray-400 text-sm">Loading…</div>
        ) : spots.length === 0 ? (
          <div className="p-4 text-center text-gray-400 text-sm">
            <p className="text-2xl mb-2">🔥</p>
            <p>No active spots yet.</p>
            <p>Create one!</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {spots.map((spot) => (
              <li
                key={spot.id}
                onClick={() => navigate(`/spot/${spot.id}`)}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-sm text-gray-900 group-hover:text-brand-600 line-clamp-1">
                    {spot.name}
                  </p>
                  <StatusBadge spot={spot} />
                </div>
                <div className="mt-1 space-y-0.5">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{spot.location.address.split(',').slice(0, 2).join(',')}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3 shrink-0" />
                    <span>{formatDateTime(spot.start_time)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <User className="w-3 h-3 shrink-0" />
                    <span>{spot.creator_name}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
