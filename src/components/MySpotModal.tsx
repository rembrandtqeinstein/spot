import { useState } from 'react';
import { X, Phone, MapPin, Clock, Lock, Globe, Loader2 } from 'lucide-react';
import { getSpotsByPhone } from '../hooks/useSpotResponses';
import { getSavedPhone, savePhone } from '../lib/mySpots';
import { Spot } from '../types';
import { formatDateTime, isSpotActive, isSpotUpcoming } from '../utils/time';
import { useNavigate } from 'react-router-dom';

type Props = { onClose: () => void };

export function MySpotModal({ onClose }: Props) {
  const [phone, setPhone] = useState(getSavedPhone());
  const [spots, setSpots] = useState<Spot[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setError('');
    try {
      savePhone(phone.trim());
      const result = await getSpotsByPhone(phone.trim());
      setSpots(result);
    } catch (err: any) {
      setError(err.message ?? 'Lookup failed');
    } finally {
      setLoading(false);
    }
  };

  const openSpot = (id: string) => { onClose(); navigate(`/spot/${id}`); };

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">My Spots</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-5 py-4 flex-1 overflow-y-auto">
          <p className="text-sm text-gray-500 mb-4">
            Enter the phone number you used when creating or RSVPing to spots.
          </p>

          <form onSubmit={handleLookup} className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Your phone number"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <button type="submit" disabled={loading || !phone.trim()}
              className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 text-white font-semibold rounded-lg text-sm transition-colors shrink-0">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Find'}
            </button>
          </form>

          {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

          {spots !== null && (
            spots.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-3xl mb-2">🔍</p>
                <p className="text-sm">No active spots found for this number.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {spots.map(spot => {
                  const active = isSpotActive(spot.start_time, spot.end_time);
                  const upcoming = isSpotUpcoming(spot.start_time);
                  return (
                    <li key={spot.id}
                      onClick={() => openSpot(spot.id)}
                      className="p-3 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer group">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-semibold text-sm text-gray-900 group-hover:text-brand-600">
                          {spot.name}
                        </p>
                        <div className="flex items-center gap-1 shrink-0">
                          {spot.visibility === 'private'
                            ? <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><Lock className="w-2.5 h-2.5" /> Private</span>
                            : <span className="text-xs bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><Globe className="w-2.5 h-2.5" /> Public</span>}
                          {active && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">Live</span>}
                          {upcoming && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">Soon</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{spot.location.address.split(',')[0]}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDateTime(spot.start_time)}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )
          )}
        </div>
      </div>
    </div>
  );
}
