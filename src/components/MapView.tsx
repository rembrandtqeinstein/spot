import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Spot } from '../types';
import { SpotPin } from './SpotPin';

type FlyToProps = { lat: number; lng: number; zoom?: number };

function FlyTo({ lat, lng, zoom = 15 }: FlyToProps) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], zoom, { duration: 1.2 });
  }, [lat, lng, zoom, map]);
  return null;
}

type Props = {
  spots: Spot[];
  highlightId?: string;
  flyTo?: { lat: number; lng: number };
};

export function MapView({ spots, highlightId, flyTo }: Props) {
  return (
    <MapContainer
      center={[40.7128, -74.006]}
      zoom={12}
      className="w-full h-full"
      zoomControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={20}
      />
      {spots.map((spot) => (
        <SpotPin
          key={spot.id}
          spot={spot}
          highlighted={spot.id === highlightId}
        />
      ))}
      {flyTo && <FlyTo lat={flyTo.lat} lng={flyTo.lng} />}
    </MapContainer>
  );
}
