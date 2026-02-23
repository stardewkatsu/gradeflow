import { useState, useMemo } from 'react';
import { SUBJECTS } from '@/lib/subjectConfig';
import { formatGrade, getGradeLabel } from '@/lib/gradeUtils';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const GRADE_TARGETS = [1.00, 1.25, 1.50, 1.75, 2.00, 2.25, 2.50, 2.75, 3.00];

function gradeToMinPercent(g: number): number {
  if (g <= 1.00) return 96;
  if (g <= 1.25) return 90;
  if (g <= 1.50) return 84;
  if (g <= 1.75) return 78;
  if (g <= 2.00) return 72;
  if (g <= 2.25) return 66;
  if (g <= 2.50) return 60;
  if (g <= 2.75) return 55;
  return 50;
}

export default function GradePredictor() {
  const [selectedId, setSelectedId] = useState(SUBJECTS[0].id);
  const [scores, setScores] = useState<Record<string, Record<string, string>>>({});
  const [targetGrade, setTargetGrade] = useState<number>(1.75);
  const [solveFor, setSolveFor] = useState<string>('');

  const subject = SUBJECTS.find(s => s.id === selectedId)!;
  const subjectScores = scores[selectedId] || {};
  const validSolveFor = subject.assessments.find(a => a.name === solveFor) ? solveFor : '';

  const prediction = useMemo(() => {
    if (!validSolveFor) return null;
    const solveAssessment = subject.assessments.find(a => a.name === validSolveFor)!;
    const targetPercent = gradeToMinPercent(targetGrade);

    let knownSum = 0;
    for (const a of subject.assessments) {
      if (a.name === validSolveFor) continue;
      const v = subjectScores[a.name];
      if (v == null || v === '' || isNaN(parseFloat(v))) return { type: 'missing' as const };
      knownSum += parseFloat(v) * a.weight;
    }

    const required = (targetPercent - knownSum) / solveAssessment.weight;
    if (required > 100) return { type: 'impossible' as const, required };
    return { type: 'ok' as const, required: Math.max(0, required), targetPercent };
  }, [subject, subjectScores, targetGrade, validSolveFor]);

  return (
    <div className="min-h-screen pb-20">
      <header className="px-5 pt-14 pb-2 text-center">
        <div className="inline-flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" strokeWidth={1.8} />
          <h1 className="text-3xl text-foreground tracking-tight">
            Predict
          </h1>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground italic">
          what do you need?
        </p>
      </header>

      <div className="px-5 pt-4 space-y-3">
        <div className="rounded-2xl bg-card p-4 card-soft space-y-3">
          <div>
            <label className="text-[9px] font-semibold text-muted-foreground/70 tracking-[0.15em] uppercase">
              Subject
            </label>
            <select
              className="mt-1 w-full rounded-xl border-0 bg-secondary/60 px-3 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 appearance-none"
              value={selectedId}
              onChange={e => { setSelectedId(e.target.value); setSolveFor(''); }}
            >
              {SUBJECTS.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[9px] font-semibold text-muted-foreground/70 tracking-[0.15em] uppercase">
              Target Grade
            </label>
            <select
              className="mt-1 w-full rounded-xl border-0 bg-secondary/60 px-3 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 appearance-none"
              value={targetGrade}
              onChange={e => setTargetGrade(parseFloat(e.target.value))}
            >
              {GRADE_TARGETS.map(g => (
                <option key={g} value={g}>{formatGrade(g)} — {getGradeLabel(g)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-2xl bg-card p-4 card-soft">
          <p className="mb-1 text-[9px] font-semibold text-muted-foreground/70 tracking-[0.15em] uppercase">
            Known Scores
          </p>
          <p className="mb-4 text-[10px] text-muted-foreground/50 italic">
            leave blank the one to solve for
          </p>
          <div className="space-y-3">
            {subject.assessments.map(a => (
              <div key={a.name}>
                <label className="text-xs text-muted-foreground">
                  {a.name}
                  <span className="ml-1 text-[10px] text-muted-foreground/50">
                    {(a.weight * 100).toFixed(0)}%
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder={validSolveFor === a.name ? '✦ solving...' : '0–100'}
                  disabled={validSolveFor === a.name}
                  className="mt-1 w-full rounded-xl border-0 bg-secondary/60 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/30 disabled:opacity-40 disabled:bg-muted/40"
                  value={validSolveFor === a.name ? '' : (subjectScores[a.name] || '')}
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
            ))}
          </div>

          <div className="mt-4">
            <label className="text-[9px] font-semibold text-muted-foreground/70 tracking-[0.15em] uppercase">
              Solve for
            </label>
            <select
              className="mt-1 w-full rounded-xl border-0 bg-secondary/60 px-3 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 appearance-none"
              value={validSolveFor}
              onChange={e => setSolveFor(e.target.value)}
            >
              <option value="">pick one…</option>
              {subject.assessments.map(a => (
                <option key={a.name} value={a.name}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>

        {prediction && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl bg-card p-5 card-soft text-center"
          >
            {prediction.type === 'missing' && (
              <p className="text-sm text-muted-foreground italic">
                fill in the other scores first
              </p>
            )}
            {prediction.type === 'impossible' && (
              <div>
                <p className="text-sm font-medium text-destructive">
                  not achievable ✕
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  you'd need {prediction.required.toFixed(1)}%
                </p>
              </div>
            )}
            {prediction.type === 'ok' && (
              <div>
                <p className="text-[9px] font-semibold text-muted-foreground/70 tracking-[0.15em] uppercase">
                  You need at least
                </p>
                <p
                  className="mt-2 text-5xl tabular-nums text-primary"
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                >
                  {prediction.required.toFixed(1)}%
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  in {validSolveFor} for a{' '}
                  <span className="font-semibold text-foreground">{formatGrade(targetGrade)}</span>
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
