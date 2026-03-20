export type SpotLocation = {
  lat: number;
  lng: number;
  address: string;
};

export type Visibility = 'public' | 'private';

export type Spot = {
  id: string;
  name: string;
  description?: string;
  location: SpotLocation;
  creator_name: string;
  start_time: string; // ISO string
  end_time: string;   // ISO string
  created_at: string; // ISO string
  visibility: Visibility;
};

export type CreateSpotInput = {
  name: string;
  description?: string;
  location: SpotLocation;
  creator_name: string;
  start_time: string;
  end_time: string;
  visibility: Visibility;
};

export type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};
