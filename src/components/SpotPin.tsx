import { divIcon } from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import { Spot } from '../types';
import { formatDateTime, isSpotActive, isSpotUpcoming } from '../utils/time';
import { useNavigate } from 'react-router-dom';

type Props = {
  spot: Spot;
  highlighted?: boolean;
};

function pinIcon(active: boolean, upcoming: boolean, highlighted: boolean) {
  const color = highlighted ? '#7c3aed' : active ? '#f97316' : upcoming ? '#3b82f6' : '#9ca3af';
  const scale = highlighted ? 1.3 : 1;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${36 * scale}" height="${42 * scale}" viewBox="0 0 36 42">
      <ellipse cx="18" cy="39" rx="6" ry="3" fill="rgba(0,0,0,0.15)"/>
      <circle cx="18" cy="18" r="16" fill="${color}" stroke="white" stroke-width="2.5"/>
      <text x="18" y="23" text-anchor="middle" font-size="16" font-family="sans-serif">🔥</text>
      <polygon points="12,30 18,40 24,30" fill="${color}"/>
    </svg>`;
  return divIcon({
    html: svg,
    className: '',
    iconSize: [36 * scale, 42 * scale],
    iconAnchor: [18 * scale, 42 * scale],
    popupAnchor: [0, -(42 * scale)],
  });
}

export function SpotPin({ spot, highlighted = false }: Props) {
  const navigate = useNavigate();
  const active = isSpotActive(spot.start_time, spot.end_time);
  const upcoming = isSpotUpcoming(spot.start_time);

  return (
    <Marker
      position={[spot.location.lat, spot.location.lng]}
      icon={pinIcon(active, upcoming, highlighted)}
      eventHandlers={{ click: () => navigate(`/spot/${spot.id}`) }}
    >
      <Popup>
        <div className="min-w-[180px]">
          <p className="font-bold text-gray-900 text-sm">{spot.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">{spot.location.address.split(',').slice(0, 2).join(',')}</p>
          <p className="text-xs text-gray-600 mt-1">
            {formatDateTime(spot.start_time)} – {formatDateTime(spot.end_time)}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">by {spot.creator_name}</p>
          <button
            className="mt-2 w-full text-xs bg-brand-500 text-white rounded px-2 py-1 hover:bg-brand-600"
            onClick={() => navigate(`/spot/${spot.id}`)}
          >
            View details
          </button>
        </div>
      </Popup>
    </Marker>
  );
}
