import { useState } from 'react';
import { SUBJECTS } from '@/lib/subjectConfig';
import { percentToGrade, formatGrade, getGradeLabel } from '@/lib/gradeUtils';
import { motion, AnimatePresence } from 'framer-motion';

export default function SubjectCalculator() {
  const [selectedId, setSelectedId] = useState(SUBJECTS[0].id);
  const [scores, setScores] = useState<Record<string, Record<string, string>>>({});

  const subject = SUBJECTS.find(s => s.id === selectedId)!;
  const subjectScores = scores[selectedId] || {};

  const allFilled = subject.assessments.every(a => {
    const v = subjectScores[a.name];
    return v != null && v !== '' && !isNaN(parseFloat(v));
  });

  const weightedPercent = allFilled
    ? subject.assessments.reduce((sum, a) => {
        return sum + parseFloat(subjectScores[a.name]) * a.weight;
      }, 0)
    : null;

  const grade = weightedPercent != null ? percentToGrade(weightedPercent) : null;

  return (
    <div className="min-h-screen pb-24">
      <header className="gwa-gradient px-4 pb-6 pt-12 text-center">
        <h1 className="text-xl font-bold text-primary-foreground tracking-tight">
          Subject Calculator
        </h1>
        <p className="mt-1 text-xs text-primary-foreground/70">
          Calculate your grade per subject
        </p>
      </header>

      <div className="px-4 -mt-3">
        {/* Subject selector */}
        <div className="rounded-xl bg-card p-4 card-shadow">
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Select Subject
          </label>
          <select
            className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-4 rounded-xl bg-card p-4 card-shadow"
          >
            <h3 className="mb-4 text-sm font-semibold text-card-foreground">
              Assessment Scores
            </h3>
            <div className="space-y-3">
              {subject.assessments.map(a => (
                <div key={a.name} className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground">
                      {a.name}{' '}
                      <span className="text-[10px]">({(a.weight * 100).toFixed(0)}%)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="0–100"
                      className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
                      value={subjectScores[a.name] || ''}
                      onChange={e => {
                        setScores(prev => ({
                          ...prev,
                          [selectedId]: {
                            ...prev[selectedId],
                            [a.name]: e.target.value,
                          },
                        }));
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {weightedPercent != null && grade != null && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 rounded-xl bg-card p-5 card-shadow text-center"
            >
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Weighted Percentage
              </p>
              <p className="mt-1 text-3xl font-bold text-card-foreground tabular-nums">
                {weightedPercent.toFixed(2)}%
              </p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
                <span className="text-lg font-bold text-primary tabular-nums">
                  {formatGrade(grade)}
                </span>
                <span className="text-xs font-medium text-primary/80">
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
