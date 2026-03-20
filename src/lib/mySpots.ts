const KEY = 'spot_my_ids';

export function getMySpotIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function saveMySpotId(id: string): void {
  const ids = getMySpotIds();
  if (!ids.includes(id)) {
    localStorage.setItem(KEY, JSON.stringify([...ids, id]));
  }
}

export function isMySpot(id: string): boolean {
  return getMySpotIds().includes(id);
}
