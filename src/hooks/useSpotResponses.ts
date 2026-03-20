import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SpotResponse } from '../types';

export function useSpotResponses(spotId: string | undefined) {
  const [responses, setResponses] = useState<SpotResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    if (!spotId) return;
    const { data } = await supabase
      .from('spot_responses')
      // Never select responder_phone — keep it server-side only
      .select('id, spot_id, responder_name, response, created_at')
      .eq('spot_id', spotId)
      .order('created_at', { ascending: true });
    setResponses((data as SpotResponse[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetch();
    if (!spotId) return;
    const channel = supabase
      .channel(`responses-${spotId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'spot_responses',
        filter: `spot_id=eq.${spotId}` }, fetch)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [spotId]);

  const submitRsvp = async (
    name: string, phone: string, response: 'yes' | 'no'
  ): Promise<void> => {
    const { error } = await supabase
      .from('spot_responses')
      .upsert(
        { spot_id: spotId, responder_name: name, responder_phone: phone, response },
        { onConflict: 'spot_id,responder_phone' }
      );
    if (error) throw new Error(error.message);
    await fetch();
  };

  const going    = responses.filter((r) => r.response === 'yes');
  const notGoing = responses.filter((r) => r.response === 'no');

  return { responses, going, notGoing, loading, submitRsvp };
}

export async function getSpotsByPhone(phone: string) {
  const now = new Date().toISOString();

  // Spots I created
  const { data: created } = await supabase
    .from('spots')
    .select('*')
    .eq('creator_phone', phone)
    .gt('end_time', now)
    .order('start_time', { ascending: true });

  // Spot IDs I RSVPed yes to
  const { data: rsvps } = await supabase
    .from('spot_responses')
    .select('spot_id')
    .eq('responder_phone', phone)
    .eq('response', 'yes');

  const rsvpIds = (rsvps ?? []).map((r: any) => r.spot_id as string);
  let rsvpSpots: any[] = [];
  if (rsvpIds.length > 0) {
    const { data } = await supabase
      .from('spots')
      .select('*')
      .in('id', rsvpIds)
      .gt('end_time', now);
    rsvpSpots = data ?? [];
  }

  // Merge without duplicates
  const createdMap = new Map((created ?? []).map((s: any) => [s.id, s]));
  for (const s of rsvpSpots) {
    if (!createdMap.has(s.id)) createdMap.set(s.id, s);
  }
  return Array.from(createdMap.values()).sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );
}
