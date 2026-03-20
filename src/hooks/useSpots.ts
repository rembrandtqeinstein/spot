import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Spot, CreateSpotInput } from '../types';
import { isSpotExpired } from '../utils/time';

export function useSpots() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSpots = useCallback(async () => {
    try {
      const now = new Date().toISOString();
      const { data, error: fetchError } = await supabase
        .from('spots')
        .select('*')
        .gt('end_time', now)  // only fetch non-expired spots
        .order('start_time', { ascending: true });

      if (fetchError) throw fetchError;
      setSpots((data as Spot[]) ?? []);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load spots');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpots();

    // Real-time subscription
    const channel = supabase
      .channel('spots-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'spots' }, () => {
        fetchSpots();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSpots]);

  const createSpot = async (input: CreateSpotInput): Promise<Spot> => {
    const { data, error: insertError } = await supabase
      .from('spots')
      .insert([input])
      .select()
      .single();

    if (insertError) throw new Error(insertError.message);
    const spot = data as Spot;
    setSpots((prev) => [...prev, spot]);
    return spot;
  };

  return { spots, loading, error, createSpot, refetch: fetchSpots };
}

export function useSpot(id: string | undefined) {
  const [spot, setSpot] = useState<Spot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('spots')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
        setSpot(data as Spot);
      } catch (err: any) {
        setError(err.message ?? 'Spot not found');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return { spot, loading, error };
}
