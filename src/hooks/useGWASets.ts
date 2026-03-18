import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface GWASet {
  id: string;
  name: string;
  created_at: string;
}

export function useGWASets() {
  const { user } = useAuth();
  const [sets, setSets] = useState<GWASet[]>([]);
  const [activeSetId, setActiveSetId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSets([]);
      setActiveSetId(null);
      setLoading(false);
      return;
    }

    const load = async () => {
      const { data } = await supabase
        .from('gwa_sets')
        .select('id, name, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (data && data.length > 0) {
        setSets(data);
        setActiveSetId(data[0].id);
      } else {
        // Create a default set
        const { data: newSet } = await supabase
          .from('gwa_sets')
          .insert({ user_id: user.id, name: 'Quarter 1' })
          .select('id, name, created_at')
          .single();
        
        if (newSet) {
          setSets([newSet]);
          setActiveSetId(newSet.id);
        }
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const addSet = useCallback(async (name: string) => {
    if (!user) return null;
    const { data } = await supabase
      .from('gwa_sets')
      .insert({ user_id: user.id, name })
      .select('id, name, created_at')
      .single();
    
    if (data) {
      setSets(prev => [...prev, data]);
      setActiveSetId(data.id);
      return data;
    }
    return null;
  }, [user]);

  const renameSet = useCallback(async (id: string, name: string) => {
    await supabase.from('gwa_sets').update({ name }).eq('id', id);
    setSets(prev => prev.map(s => s.id === id ? { ...s, name } : s));
  }, []);

  const deleteSet = useCallback(async (id: string) => {
    await supabase.from('gwa_sets').delete().eq('id', id);
    setSets(prev => {
      const next = prev.filter(s => s.id !== id);
      if (activeSetId === id && next.length > 0) {
        setActiveSetId(next[0].id);
      }
      return next;
    });
  }, [activeSetId]);

  return { sets, activeSetId, setActiveSetId, addSet, renameSet, deleteSet, loading };
}
