const IDS_KEY   = 'spot_my_ids';
const PHONE_KEY  = 'spot_my_phone';
const RSVP_KEY   = (spotId: string) => `spot_rsvp_${spotId}`;

// --- Spot IDs (localStorage fallback for creators) ---
export function getMySpotIds(): string[] {
  try { return JSON.parse(localStorage.getItem(IDS_KEY) ?? '[]'); }
  catch { return []; }
}
export function saveMySpotId(id: string): void {
  const ids = getMySpotIds();
  if (!ids.includes(id)) localStorage.setItem(IDS_KEY, JSON.stringify([...ids, id]));
}
export function isMySpot(id: string): boolean {
  return getMySpotIds().includes(id);
}

// --- Phone (identity) ---
export function getSavedPhone(): string {
  return localStorage.getItem(PHONE_KEY) ?? '';
}
export function savePhone(phone: string): void {
  localStorage.setItem(PHONE_KEY, phone);
}

// --- RSVP state ---
export function getSavedRsvp(spotId: string): 'yes' | 'no' | null {
  const v = localStorage.getItem(RSVP_KEY(spotId));
  return (v === 'yes' || v === 'no') ? v : null;
}
export function saveRsvp(spotId: string, response: 'yes' | 'no'): void {
  localStorage.setItem(RSVP_KEY(spotId), response);
}
