import { useState, FormEvent } from 'react';
import { X, Flame, User, AlignLeft, Clock } from 'lucide-react';
import { CreateSpotInput, SpotLocation } from '../types';
import { getAllowedStartRange, getMaxEndTime, toDatetimeLocal, fromDatetimeLocal } from '../utils/time';
import { LocationSearchInput } from './LocationSearchInput';

type Props = {
  onClose: () => void;
  onCreate: (input: CreateSpotInput) => Promise<void>;
};

type FormErrors = Partial<Record<keyof CreateSpotInput | 'general', string>>;

export function CreateSpotModal({ onClose, onCreate }: Props) {
  const { min, max } = getAllowedStartRange();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [location, setLocation] = useState<SpotLocation | null>(null);
  const [startTime, setStartTime] = useState(toDatetimeLocal(min));
  const [endTime, setEndTime] = useState(toDatetimeLocal(new Date(min.getTime() + 2 * 60 * 60 * 1000)));
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!name.trim()) errs.name = 'Event name is required';
    if (!creatorName.trim()) errs.creator_name = 'Your name is required';
    if (!location) errs.location = 'Please select a location';

    const start = fromDatetimeLocal(startTime);
    const end = fromDatetimeLocal(endTime);
    const now = new Date();
    const maxStart = getAllowedStartRange().max;
    const maxEnd = getMaxEndTime(start);

    if (start < now) errs.start_time = 'Start time must be in the future';
    if (start > maxStart) errs.start_time = 'Start time must be within 24 hours from now';
    if (end <= start) errs.end_time = 'End time must be after start time';
    if (end > maxEnd) errs.end_time = 'Duration cannot exceed 24 hours';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onCreate({
        name: name.trim(),
        description: description.trim() || undefined,
        creator_name: creatorName.trim(),
        location: location!,
        start_time: fromDatetimeLocal(startTime).toISOString(),
        end_time: fromDatetimeLocal(endTime).toISOString(),
      });
      onClose();
    } catch (err: any) {
      setErrors({ general: err.message ?? 'Failed to create spot' });
    } finally {
      setSubmitting(false);
    }
  };

  const { min: minStart, max: maxStart } = getAllowedStartRange();

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-brand-500" />
            <h2 className="text-lg font-semibold text-gray-900">Create a Spot</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {errors.general && (
            <div className="bg-red-50 text-red-700 text-sm rounded-lg px-3 py-2">{errors.general}</div>
          )}

          {/* Event name */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Event Name *</label>
            <div className="relative">
              <Flame className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="What's happening?"
                className={`w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
              />
            </div>
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Creator name */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Your Name *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                placeholder="Who are you?"
                className={`w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.creator_name ? 'border-red-400' : 'border-gray-300'}`}
              />
            </div>
            {errors.creator_name && <p className="text-xs text-red-500 mt-1">{errors.creator_name}</p>}
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Location *</label>
            <LocationSearchInput
              value={location}
              onChange={setLocation}
              error={errors.location}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Description (optional)</label>
            <div className="relative">
              <AlignLeft className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell people more about it..."
                rows={2}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              <Clock className="inline w-3 h-3 mr-1" />Start Time *
            </label>
            <input
              type="datetime-local"
              value={startTime}
              min={toDatetimeLocal(minStart)}
              max={toDatetimeLocal(maxStart)}
              onChange={(e) => setStartTime(e.target.value)}
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.start_time ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.start_time && <p className="text-xs text-red-500 mt-1">{errors.start_time}</p>}
          </div>

          {/* End Time */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              <Clock className="inline w-3 h-3 mr-1" />End Time *
              <span className="text-gray-400 font-normal ml-1">(max 24h from start)</span>
            </label>
            <input
              type="datetime-local"
              value={endTime}
              min={startTime}
              max={toDatetimeLocal(getMaxEndTime(fromDatetimeLocal(startTime)))}
              onChange={(e) => setEndTime(e.target.value)}
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.end_time ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.end_time && <p className="text-xs text-red-500 mt-1">{errors.end_time}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {submitting ? 'Creating…' : 'Create Spot 🔥'}
          </button>
        </form>
      </div>
    </div>
  );
}
