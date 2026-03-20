import { divIcon } from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import { Spot } from '../types';
import { formatDateTime, formatTime, isSpotActive, isSpotUpcoming } from '../utils/time';
import { useNavigate } from 'react-router-dom';

type Props = {
  spot: Spot;
  highlighted?: boolean;
};

function pinIcon(active: boolean, upcoming: boolean, highlighted: boolean) {
  const color = highlighted ? '#7c3aed' : active ? '#f97316' : upcoming ? '#3b82f6' : '#9ca3af';
  const size = highlighted ? 44 : 36;
  const ring = highlighted ? `<circle cx="18" cy="18" r="22" fill="none" stroke="${color}" stroke-width="2" opacity="0.35"/>` : '';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 8}" viewBox="0 0 36 44">
      ${ring}
      <filter id="shadow">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.25)"/>
      </filter>
      <circle cx="18" cy="18" r="15" fill="${color}" filter="url(#shadow)"/>
      <circle cx="18" cy="18" r="15" fill="none" stroke="white" stroke-width="2"/>
      <text x="18" y="23" text-anchor="middle" font-size="14" font-family="sans-serif">🔥</text>
      <polygon points="13,30 18,40 23,30" fill="${color}" filter="url(#shadow)"/>
    </svg>`;
  return divIcon({
    html: svg,
    className: '',
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, size + 8],
    popupAnchor: [0, -(size + 8)],
  });
}

function statusLabel(active: boolean, upcoming: boolean) {
  if (active) return { text: 'Live now', bg: '#dcfce7', color: '#15803d' };
  if (upcoming) return { text: 'Upcoming', bg: '#dbeafe', color: '#1d4ed8' };
  return { text: 'Ended', bg: '#f3f4f6', color: '#6b7280' };
}

export function SpotPin({ spot, highlighted = false }: Props) {
  const navigate = useNavigate();
  const active = isSpotActive(spot.start_time, spot.end_time);
  const upcoming = isSpotUpcoming(spot.start_time);
  const status = statusLabel(active, upcoming);
  const shortAddress = spot.location.address.split(',').slice(0, 2).join(',');

  const popupContent = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;width:220px;padding:2px 0">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <span style="font-size:11px;font-weight:600;background:${status.bg};color:${status.color};padding:2px 8px;border-radius:99px">
          ${status.text}
        </span>
      </div>
      <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#111827;line-height:1.3">${spot.name}</p>
      <p style="margin:0 0 8px;font-size:12px;color:#6b7280;line-height:1.4">📍 ${shortAddress}</p>
      <div style="background:#f9fafb;border-radius:8px;padding:8px;margin-bottom:10px">
        <p style="margin:0 0 3px;font-size:11px;color:#374151">
          <span style="color:#9ca3af">From</span> <strong>${formatTime(spot.start_time)}</strong>
          <span style="color:#9ca3af"> to </span> <strong>${formatTime(spot.end_time)}</strong>
        </p>
        <p style="margin:0;font-size:11px;color:#9ca3af">by ${spot.creator_name}</p>
      </div>
      <button
        onclick="window.location.href='/spot/${spot.id}'"
        style="width:100%;background:#f97316;color:white;border:none;border-radius:8px;padding:8px;font-size:13px;font-weight:600;cursor:pointer;transition:background 0.15s"
        onmouseover="this.style.background='#ea580c'"
        onmouseout="this.style.background='#f97316'"
      >
        View details →
      </button>
    </div>`;

  return (
    <Marker
      position={[spot.location.lat, spot.location.lng]}
      icon={pinIcon(active, upcoming, highlighted)}
      eventHandlers={{
        mouseover(e) { e.target.openPopup(); },
        click() { navigate(`/spot/${spot.id}`); },
      }}
    >
      <Popup closeButton={false} className="spot-popup">
        <div dangerouslySetInnerHTML={{ __html: popupContent }} />
      </Popup>
    </Marker>
  );
}
