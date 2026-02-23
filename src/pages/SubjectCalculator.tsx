import { useState } from 'react';
import { SUBJECTS } from '@/lib/subjectConfig';
import { percentToGrade, formatGrade, getGradeLabel } from '@/lib/gradeUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';

interface SubScores {
  [assessmentName: string]: {
    mode: 'single' | 'multi';
    single: string;
    items: string[];
  };
}

export default function SubjectCalculator() {
  const [selectedId, setSelectedId] = useState(SUBJECTS[0].id);
  const [allScores, setAllScores] = useState<Record<string, SubScores>>({});

  const subject = SUBJECTS.find(s => s.id === selectedId)!;
  const subjectScores = allScores[selectedId] || {};

  const getAssessmentValue = (name: string): number | null => {
    const entry = subjectScores[name];
    if (!entry) return null;

    if (entry.mode === 'multi' && entry.items.length > 0) {
      const nums = entry.items.filter(v => v !== '' && !isNaN(parseFloat(v))).map(Number);
      if (nums.length === 0) return null;
      return nums.reduce((a, b) => a + b, 0) / nums.length;
    }

    if (entry.single && !isNaN(parseFloat(entry.single))) {
      return parseFloat(entry.single);
    }
    return null;
  };

  const allFilled = subject.assessments.every(a => getAssessmentValue(a.name) !== null);

  const weightedPercent = allFilled
    ? subject.assessments.reduce((sum, a) => sum + getAssessmentValue(a.name)! * a.weight, 0)
    : null;

  const grade = weightedPercent != null ? percentToGrade(weightedPercent) : null;

  const updateEntry = (name: string, update: Partial<SubScores[string]>) => {
    setAllScores(prev => ({
      ...prev,
      [selectedId]: {
        ...prev[selectedId],
        [name]: {
          mode: 'single',
          single: '',
          items: [],
          ...prev[selectedId]?.[name],
          ...update,
        },
      },
    }));
  };

  const isFA = (name: string) =>
    name.toLowerCase().includes('quiz') || name.toLowerCase().includes('fa');

  return (
    <div className="min-h-screen pb-20">
      <header className="px-5 pt-14 pb-2 text-center">
        <h1 className="text-3xl text-foreground tracking-tight">
          Calculator
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground italic">
          compute per subject
        </p>
      </header>

      <div className="px-5 pt-4 space-y-3">
        {/* Subject selector */}
        <div className="rounded-2xl bg-card p-4 card-soft">
          <label className="text-[9px] font-semibold text-muted-foreground/70 tracking-[0.15em] uppercase">
            Subject
          </label>
          <select
            className="mt-1 w-full rounded-xl border-0 bg-secondary/60 px-3 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 appearance-none"
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
          >
            {SUBJECTS.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Assessment inputs */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedId}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl bg-card p-4 card-soft"
          >
            <p className="mb-4 text-[9px] font-semibold text-muted-foreground/70 tracking-[0.15em] uppercase">
              Assessments
            </p>
            <div className="space-y-4">
              {subject.assessments.map(a => {
                const entry = subjectScores[a.name] || { mode: 'single' as const, single: '', items: [] };
                const showMulti = isFA(a.name);
                const avg = getAssessmentValue(a.name);

                return (
                  <div key={a.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs text-muted-foreground">
                        {a.name}
                        <span className="ml-1 text-[10px] text-muted-foreground/50">
                          {(a.weight * 100).toFixed(0)}%
                        </span>
                      </label>
                      {showMulti && (
                        <button
                          onClick={() => {
                            const newMode = entry.mode === 'multi' ? 'single' : 'multi';
                            updateEntry(a.name, {
                              mode: newMode,
                              items: newMode === 'multi' && entry.items.length === 0 ? ['', ''] : entry.items,
                            });
                          }}
                          className="text-[9px] font-medium text-primary/70 hover:text-primary transition-colors"
                        >
                          {entry.mode === 'multi' ? 'use total' : 'add items'}
                        </button>
                      )}
                    </div>

                    {entry.mode === 'single' || !showMulti ? (
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="0–100"
                        className="w-full rounded-xl border-0 bg-secondary/60 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
                        value={entry.single || ''}
                        onChange={e => updateEntry(a.name, { single: e.target.value })}
                      />
                    ) : (
                      <div className="space-y-1.5">
                        {entry.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <span className="text-[9px] text-muted-foreground/50 w-4 text-right tabular-nums">
                              {idx + 1}
                            </span>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              placeholder={`Item ${idx + 1}`}
                              className="flex-1 rounded-xl border-0 bg-secondary/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
                              value={item}
                              onChange={e => {
                                const newItems = [...entry.items];
                                newItems[idx] = e.target.value;
                                updateEntry(a.name, { items: newItems });
                              }}
                            />
                            {entry.items.length > 1 && (
                              <button
                                onClick={() => {
                                  const newItems = entry.items.filter((_, j) => j !== idx);
                                  updateEntry(a.name, { items: newItems });
                                }}
                                className="p-1 text-muted-foreground/40 hover:text-destructive transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => updateEntry(a.name, { items: [...entry.items, ''] })}
                          className="flex items-center gap-1 text-[10px] font-medium text-primary/60 hover:text-primary transition-colors py-1"
                        >
                          <Plus className="h-3 w-3" />
                          add item
                        </button>
                        {avg !== null && (
                          <p className="text-[10px] text-muted-foreground/60 italic">
                            avg: {avg.toFixed(1)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {weightedPercent != null && grade != null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl bg-card p-5 card-soft text-center"
            >
              <p className="text-[9px] font-semibold text-muted-foreground/70 tracking-[0.15em] uppercase">
                Result
              </p>
              <p
                className="mt-2 text-4xl tabular-nums text-foreground"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                {weightedPercent.toFixed(1)}%
              </p>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary/8 px-4 py-1.5">
                <span
                  className="text-lg tabular-nums text-primary"
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                >
                  {formatGrade(grade)}
                </span>
                <span className="text-[10px] font-medium text-primary/70">
                  {getGradeLabel(grade)}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
