import { useState } from 'react';
import { CheckCircle2, XCircle, Users, Phone, User } from 'lucide-react';
import { useSpotResponses } from '../hooks/useSpotResponses';
import { getSavedRsvp, saveRsvp, getSavedPhone, savePhone } from '../lib/mySpots';

type Props = { spotId: string; expired: boolean };

export function RsvpSection({ spotId, expired }: Props) {
  const { going, notGoing, loading, submitRsvp } = useSpotResponses(spotId);
  const [saved, setSaved] = useState<'yes' | 'no' | null>(() => getSavedRsvp(spotId));
  const [showForm, setShowForm] = useState(false);
  const [pending, setPending] = useState<'yes' | 'no' | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState(() => getSavedPhone());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleRsvpClick = (response: 'yes' | 'no') => {
    if (expired) return;
    setPending(response);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) { setError('Name and phone are required'); return; }
    setSubmitting(true);
    setError('');
    try {
      await submitRsvp(name.trim(), phone.trim(), pending!);
      savePhone(phone.trim());
      saveRsvp(spotId, pending!);
      setSaved(pending);
      setShowForm(false);
    } catch (err: any) {
      setError(err.message ?? 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-6 border-t pt-5">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-4 h-4 text-brand-500" />
        <h3 className="font-semibold text-sm text-gray-800">Who's coming?</h3>
      </div>

      {/* Response counts */}
      {!loading && (
        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-green-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{going.length}</p>
            <p className="text-xs text-green-700 font-medium">Going</p>
            {going.length > 0 && (
              <p className="text-xs text-green-600 mt-1 truncate">
                {going.slice(0, 3).map(r => r.responder_name).join(', ')}
                {going.length > 3 ? ` +${going.length - 3}` : ''}
              </p>
            )}
          </div>
          <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-gray-500">{notGoing.length}</p>
            <p className="text-xs text-gray-500 font-medium">Not going</p>
          </div>
        </div>
      )}

      {/* Already responded */}
      {saved && !showForm && (
        <div className={`flex items-center gap-2 p-3 rounded-xl mb-3 text-sm font-medium
          ${saved === 'yes' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'}`}>
          {saved === 'yes'
            ? <><CheckCircle2 className="w-4 h-4" /> You're going!</>
            : <><XCircle className="w-4 h-4" /> You said you're not going</>}
          {!expired && (
            <button onClick={() => setShowForm(true)}
              className="ml-auto text-xs underline opacity-60 hover:opacity-100">
              Change
            </button>
          )}
        </div>
      )}

      {/* RSVP buttons */}
      {!saved && !showForm && !expired && (
        <div className="flex gap-2">
          <button onClick={() => handleRsvpClick('yes')}
            className="flex-1 flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
            <CheckCircle2 className="w-4 h-4" /> Going
          </button>
          <button onClick={() => handleRsvpClick('no')}
            className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl text-sm transition-colors">
            <XCircle className="w-4 h-4" /> Can't make it
          </button>
        </div>
      )}

      {/* RSVP form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-3 mt-1">
          <p className="text-xs text-gray-500">
            {pending === 'yes' ? '🎉 Marking you as going!' : 'Letting them know you can\'t make it'}
          </p>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Your name" required
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="Your phone (private, used as your ID)" required
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <p className="text-xs text-gray-400">📵 Your phone is never shown to anyone — it's just your ID.</p>
          <div className="flex gap-2">
            <button type="submit" disabled={submitting}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors
                ${pending === 'yes' ? 'bg-green-500 hover:bg-green-600 disabled:bg-green-300'
                  : 'bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300'}`}>
              {submitting ? 'Saving…' : 'Confirm'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
