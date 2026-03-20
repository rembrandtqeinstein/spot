import { useRef } from 'react';
import { divIcon } from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import { Spot } from '../types';
import { formatTime, isSpotActive, isSpotUpcoming } from '../utils/time';
import { useNavigate } from 'react-router-dom';

type Props = {
  spot: Spot;
  highlighted?: boolean;
};

function pinIcon(active: boolean, upcoming: boolean, highlighted: boolean) {
  const color = highlighted ? '#7c3aed' : active ? '#f97316' : upcoming ? '#3b82f6' : '#9ca3af';
  const size = highlighted ? 44 : 36;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 8}" viewBox="0 0 36 44">
      <filter id="s"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.25)"/></filter>
      <circle cx="18" cy="18" r="15" fill="${color}" filter="url(#s)"/>
      <circle cx="18" cy="18" r="15" fill="none" stroke="white" stroke-width="2"/>
      <text x="18" y="23" text-anchor="middle" font-size="14" font-family="sans-serif">🔥</text>
      <polygon points="13,30 18,40 23,30" fill="${color}" filter="url(#s)"/>
    </svg>`;
  return divIcon({
    html: svg,
    className: '',
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, size + 8],
    popupAnchor: [0, -(size + 10)],
  });
}

export function SpotPin({ spot, highlighted = false }: Props) {
  const navigate = useNavigate();
  const markerRef = useRef<any>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const active = isSpotActive(spot.start_time, spot.end_time);
  const upcoming = isSpotUpcoming(spot.start_time);
  const shortAddress = spot.location.address.split(',').slice(0, 2).join(',');

  const statusColor = active
    ? { bg: '#dcfce7', text: '#15803d', label: 'Live now' }
    : upcoming
    ? { bg: '#dbeafe', text: '#1d4ed8', label: 'Upcoming' }
    : { bg: '#f3f4f6', text: '#6b7280', label: 'Ended' };

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      markerRef.current?.closePopup();
    }, 300);
  };

  return (
    <Marker
      ref={markerRef}
      position={[spot.location.lat, spot.location.lng]}
      icon={pinIcon(active, upcoming, highlighted)}
      eventHandlers={{
        mouseover() { cancelClose(); markerRef.current?.openPopup(); },
        mouseout()  { scheduleClose(); },
        click()     { navigate(`/spot/${spot.id}`); },
      }}
    >
      <Popup closeButton={false} className="spot-popup">
        {/* onMouseEnter cancels the close timer; onMouseLeave restarts it */}
        <div
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          style={{ width: 220, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
        >
          <span style={{
            display: 'inline-block', fontSize: 11, fontWeight: 600,
            background: statusColor.bg, color: statusColor.text,
            padding: '2px 8px', borderRadius: 99, marginBottom: 8,
          }}>
            {statusColor.label}
          </span>
          <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>
            {spot.name}
          </p>
          <p style={{ margin: '0 0 8px', fontSize: 12, color: '#6b7280' }}>
            📍 {shortAddress}
          </p>
          <div style={{ background: '#f9fafb', borderRadius: 8, padding: 8, marginBottom: 10 }}>
            <p style={{ margin: '0 0 3px', fontSize: 11, color: '#374151' }}>
              <span style={{ color: '#9ca3af' }}>From </span>
              <strong>{formatTime(spot.start_time)}</strong>
              <span style={{ color: '#9ca3af' }}> to </span>
              <strong>{formatTime(spot.end_time)}</strong>
            </p>
            <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>by {spot.creator_name}</p>
          </div>
          <button
            onClick={() => navigate(`/spot/${spot.id}`)}
            style={{
              width: '100%', background: '#f97316', color: 'white',
              border: 'none', borderRadius: 8, padding: '8px 0',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            View details →
          </button>
        </div>
      </Popup>
    </Marker>
  );
}
