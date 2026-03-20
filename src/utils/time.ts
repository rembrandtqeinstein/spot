import { format, isAfter, isBefore, addHours, startOfDay, endOfDay, addDays } from 'date-fns';

/** Returns true if the spot is currently active (between start and end time) */
export function isSpotActive(startTime: string, endTime: string): boolean {
  const now = new Date();
  return isAfter(now, new Date(startTime)) && isBefore(now, new Date(endTime));
}

/** Returns true if the spot hasn't started yet but is upcoming */
export function isSpotUpcoming(startTime: string): boolean {
  return isAfter(new Date(startTime), new Date());
}

/** Returns true if the spot has ended */
export function isSpotExpired(endTime: string): boolean {
  return isAfter(new Date(), new Date(endTime));
}

/** Format a date for display */
export function formatTime(isoString: string): string {
  return format(new Date(isoString), 'h:mm a');
}

export function formatDate(isoString: string): string {
  return format(new Date(isoString), 'MMM d, yyyy');
}

export function formatDateTime(isoString: string): string {
  return format(new Date(isoString), 'MMM d · h:mm a');
}

/** Returns the min/max allowed start times for event creation:
 *  - min: now (rounded to next 5 min)
 *  - max: 24 hours from now
 */
export function getAllowedStartRange(): { min: Date; max: Date } {
  const now = new Date();
  const min = new Date(Math.ceil(now.getTime() / (5 * 60 * 1000)) * (5 * 60 * 1000));
  const max = addHours(now, 24);
  return { min, max };
}

/** Given a start time, returns max allowed end time (start + 24h, but capped at start + 24h) */
export function getMaxEndTime(startTime: Date): Date {
  return addHours(startTime, 24);
}

/** Format Date to local datetime-local input value */
export function toDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Parse datetime-local string to Date */
export function fromDatetimeLocal(value: string): Date {
  return new Date(value);
}
