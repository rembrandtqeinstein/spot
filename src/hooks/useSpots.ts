import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Spot, CreateSpotInput } from '../types';
import { getMySpotIds, saveMySpotId } from '../lib/mySpots';

export function useSpots() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSpots = useCallback(async () => {
    try {
      const now = new Date().toISOString();
      const myIds = getMySpotIds();

      // Fetch public non-expired spots
      const { data: publicData, error: publicError } = await supabase
        .from('spots')
        .select('*')
        .gt('end_time', now)
        .eq('visibility', 'public')
        .order('start_time', { ascending: true });

      if (publicError) throw publicError;

      let combined: Spot[] = (publicData as Spot[]) ?? [];

      // Also fetch creator's own spots (including private) that haven't expired
      if (myIds.length > 0) {
        const { data: myData } = await supabase
          .from('spots')
          .select('*')
          .gt('end_time', now)
          .in('id', myIds);

        if (myData) {
          // Merge without duplicates
          const existingIds = new Set(combined.map((s) => s.id));
          const myOnly = (myData as Spot[]).filter((s) => !existingIds.has(s.id));
          combined = [...combined, ...myOnly].sort(
            (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
          );
        }
      }

      setSpots(combined);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load spots');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpots();

    const channel = supabase
      .channel('spots-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'spots' }, () => {
        fetchSpots();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchSpots]);

  const createSpot = async (input: CreateSpotInput): Promise<Spot> => {
    const { data, error: insertError } = await supabase
      .from('spots')
      .insert([input])
      .select()
      .single();

    if (insertError) throw new Error(insertError.message);
    const spot = data as Spot;
    saveMySpotId(spot.id);   // remember this spot in localStorage
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
          .maybeSingle();

        if (fetchError) throw fetchError;
        if (!data) throw new Error('Spot not found or has expired');
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
