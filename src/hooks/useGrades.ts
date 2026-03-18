import { useState, useCallback, useEffect } from 'react';
import { SUBJECTS } from '@/lib/subjectConfig';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface SubjectGrades {
  previousGrade: number | null;
  tentativeGrade: number | null;
}

export type GradeMap = Record<string, SubjectGrades>;

function createInitial(): GradeMap {
  const m: GradeMap = {};
  SUBJECTS.forEach(s => {
    m[s.id] = { previousGrade: null, tentativeGrade: null };
  });
  return m;
}

export function useGrades(setId: string | null) {
  const { user } = useAuth();
  const [grades, setGrades] = useState<GradeMap>(createInitial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user || !setId) {
      setGrades(createInitial());
      setLoaded(false);
      return;
    }

    const load = async () => {
      const { data } = await supabase
        .from('grades')
        .select('subject_id, previous_grade, tentative_grade')
        .eq('user_id', user.id)
        .eq('set_id', setId);

      const initial = createInitial();
      if (data) {
        data.forEach(row => {
          initial[row.subject_id] = {
            previousGrade: row.previous_grade != null ? Number(row.previous_grade) : null,
            tentativeGrade: row.tentative_grade != null ? Number(row.tentative_grade) : null,
          };
        });
      }
      setGrades(initial);
      setLoaded(true);
    };
    load();
  }, [user, setId]);

  const updateGrade = useCallback(async (
    subjectId: string,
    field: 'previousGrade' | 'tentativeGrade',
    value: number | null
  ) => {
    setGrades(prev => ({
      ...prev,
      [subjectId]: { ...prev[subjectId], [field]: value },
    }));

    if (!user || !setId) return;

    const dbField = field === 'previousGrade' ? 'previous_grade' : 'tentative_grade';
    await supabase.from('grades').upsert({
      user_id: user.id,
      subject_id: subjectId,
      set_id: setId,
      [dbField]: value,
    }, { onConflict: 'user_id,subject_id,set_id' });
  }, [user, setId]);

  const resetAll = useCallback(async () => {
    setGrades(createInitial());
    if (user && setId) {
      await supabase.from('grades').delete().eq('user_id', user.id).eq('set_id', setId);
    }
  }, [user, setId]);

  return { grades, updateGrade, resetAll, loaded };
}
