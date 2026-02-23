import { useState, useCallback } from 'react';
import { SUBJECTS } from '@/lib/subjectConfig';

export interface SubjectGrades {
  previousGrade: number | null;
  tentativeGrade: number | null;
}

export type GradeMap = Record<string, SubjectGrades>;

const STORAGE_KEY = 'gwa-calculator-grades';

function createInitial(): GradeMap {
  const m: GradeMap = {};
  SUBJECTS.forEach(s => {
    m[s.id] = { previousGrade: null, tentativeGrade: null };
  });
  return m;
}

function loadGrades(): GradeMap {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const initial = createInitial();
      // Merge saved with initial to handle new subjects
      return { ...initial, ...parsed };
    }
  } catch { /* ignore */ }
  return createInitial();
}

export function useGrades() {
  const [grades, setGrades] = useState<GradeMap>(loadGrades);

  const updateGrade = useCallback((
    subjectId: string,
    field: 'previousGrade' | 'tentativeGrade',
    value: number | null
  ) => {
    setGrades(prev => {
      const next = {
        ...prev,
        [subjectId]: { ...prev[subjectId], [field]: value },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    const initial = createInitial();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    setGrades(initial);
  }, []);

  return { grades, updateGrade, resetAll };
}
