import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapView } from '../components/MapView';
import { Navbar } from '../components/Navbar';
import { CreateSpotModal } from '../components/CreateSpotModal';
import { useSpot, useSpots } from '../hooks/useSpots';
import { formatDateTime, isSpotActive, isSpotUpcoming, isSpotExpired } from '../utils/time';
import {
  MapPin, Clock, User, AlignLeft, Share2, ChevronLeft,
  CheckCircle2, XCircle, Hourglass, Copy, Check,
} from 'lucide-react';
import { CreateSpotInput } from '../types';

export function SpotPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { spot, loading, error } = useSpot(id);
  const { spots, createSpot } = useSpots();
  const [showCreate, setShowCreate] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCreate = async (input: CreateSpotInput) => {
    const created = await createSpot(input);
    setShowCreate(false);
    navigate(`/spot/${created.id}`);
  };

  const handleShare = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <Navbar onCreateClick={() => setShowCreate(true)} />
        <div className="flex-1 flex items-center justify-center text-gray-400">Loading…</div>
      </div>
    );
  }

  if (error || !spot) {
    return (
      <div className="flex flex-col h-screen">
        <Navbar onCreateClick={() => setShowCreate(true)} />
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-4">
          <XCircle className="w-10 h-10 text-red-400" />
          <p className="text-lg font-medium">Spot not found</p>
          <p className="text-sm text-gray-400">{error ?? 'This spot may have expired.'}</p>
          <button onClick={() => navigate('/')} className="text-brand-500 hover:underline text-sm">
            ← Back to map
          </button>
        </div>
      </div>
    );
  }

  const active = isSpotActive(spot.start_time, spot.end_time);
  const upcoming = isSpotUpcoming(spot.start_time);
  const expired = isSpotExpired(spot.end_time);

  const allSpots = spots.length > 0 ? spots : [spot];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar onCreateClick={() => setShowCreate(true)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Detail panel */}
        <aside className="w-full sm:w-80 lg:w-96 h-full flex flex-col bg-white border-r border-gray-200 overflow-y-auto shrink-0">
          <div className="px-4 pt-4 pb-2 flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
            >
              <ChevronLeft className="w-4 h-4" />
              All Spots
            </button>
          </div>

          <div className="px-4 pb-4">
            {/* Status */}
            <div className="mb-3">
              {active && (
                <span className="inline-flex items-center gap-1 text-sm bg-green-100 text-green-700 font-semibold px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-4 h-4" /> Live Now
                </span>
              )}
              {upcoming && (
                <span className="inline-flex items-center gap-1 text-sm bg-blue-100 text-blue-700 font-semibold px-3 py-1 rounded-full">
                  <Hourglass className="w-4 h-4" /> Upcoming
                </span>
              )}
              {expired && (
                <span className="inline-flex items-center gap-1 text-sm bg-gray-100 text-gray-500 font-semibold px-3 py-1 rounded-full">
                  <XCircle className="w-4 h-4" /> Ended
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">{spot.name}</h1>

            <div className="space-y-3">
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 mt-0.5 text-brand-500 shrink-0" />
                <span>{spot.location.address}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-brand-500 shrink-0" />
                <div>
                  <span>{formatDateTime(spot.start_time)}</span>
                  <span className="text-gray-400 mx-1">→</span>
                  <span>{formatDateTime(spot.end_time)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4 text-brand-500 shrink-0" />
                <span>Created by <strong>{spot.creator_name}</strong></span>
              </div>

              {spot.description && (
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <AlignLeft className="w-4 h-4 mt-0.5 text-brand-500 shrink-0" />
                  <p>{spot.description}</p>
                </div>
              )}
            </div>

            {/* Share */}
            <div className="mt-6 p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 font-medium mb-2 flex items-center gap-1">
                <Share2 className="w-3 h-3" /> Share this spot
              </p>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={window.location.href}
                  className="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-600 truncate"
                />
                <button
                  onClick={handleShare}
                  className="shrink-0 flex items-center gap-1 text-xs bg-brand-500 hover:bg-brand-600 text-white px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Map fills rest */}
        <div className="flex-1 hidden sm:block">
          <MapView
            spots={allSpots}
            highlightId={spot.id}
            flyTo={{ lat: spot.location.lat, lng: spot.location.lng }}
          />
        </div>
      </div>

      {showCreate && (
        <CreateSpotModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      )}
    </div>
  );
}
