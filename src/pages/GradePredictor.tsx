import { useState, useMemo } from 'react';
import { SUBJECTS } from '@/lib/subjectConfig';
import { percentToGrade, formatGrade, getGradeLabel } from '@/lib/gradeUtils';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const GRADE_TARGETS = [1.00, 1.25, 1.50, 1.75, 2.00, 2.25, 2.50, 2.75, 3.00];

export default function GradePredictor() {
  const [selectedId, setSelectedId] = useState(SUBJECTS[0].id);
  const [scores, setScores] = useState<Record<string, Record<string, string>>>({});
  const [targetGrade, setTargetGrade] = useState<number>(1.75);
  const [solveFor, setSolveFor] = useState<string>('');

  const subject = SUBJECTS.find(s => s.id === selectedId)!;
  const subjectScores = scores[selectedId] || {};

  // When subject changes, reset solveFor if invalid
  const validSolveFor = subject.assessments.find(a => a.name === solveFor) ? solveFor : '';

  const prediction = useMemo(() => {
    if (!validSolveFor) return null;

    const solveAssessment = subject.assessments.find(a => a.name === validSolveFor)!;

    // Find the minimum percentage needed for target grade
    let targetPercent: number;
    if (targetGrade <= 1.00) targetPercent = 96;
    else if (targetGrade <= 1.25) targetPercent = 90;
    else if (targetGrade <= 1.50) targetPercent = 84;
    else if (targetGrade <= 1.75) targetPercent = 78;
    else if (targetGrade <= 2.00) targetPercent = 72;
    else if (targetGrade <= 2.25) targetPercent = 66;
    else if (targetGrade <= 2.50) targetPercent = 60;
    else if (targetGrade <= 2.75) targetPercent = 55;
    else targetPercent = 50;

    // Sum known weighted scores
    let knownSum = 0;
    let allKnown = true;
    for (const a of subject.assessments) {
      if (a.name === validSolveFor) continue;
      const v = subjectScores[a.name];
      if (v == null || v === '' || isNaN(parseFloat(v))) {
        allKnown = false;
        break;
      }
      knownSum += parseFloat(v) * a.weight;
    }

    if (!allKnown) return { type: 'missing' as const };

    // Required: knownSum + x * solveWeight >= targetPercent
    const required = (targetPercent - knownSum) / solveAssessment.weight;

    if (required > 100) {
      return { type: 'impossible' as const, required };
    }

    return {
      type: 'ok' as const,
      required: Math.max(0, required),
      targetPercent,
    };
  }, [subject, subjectScores, targetGrade, validSolveFor]);

  return (
    <div className="min-h-screen pb-24">
      <header className="gwa-gradient px-4 pb-6 pt-12 text-center">
        <div className="inline-flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          <h1 className="text-xl font-bold text-primary-foreground tracking-tight">
            Grade Advisor
          </h1>
        </div>
        <p className="mt-1 text-xs text-primary-foreground/70">
          Find what you need to hit your target
        </p>
      </header>

      <div className="px-4 -mt-3 space-y-4">
        {/* Subject + Target */}
        <div className="rounded-xl bg-card p-4 card-shadow space-y-3">
          <div>
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Subject
            </label>
            <select
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              value={selectedId}
              onChange={e => { setSelectedId(e.target.value); setSolveFor(''); }}
            >
              {SUBJECTS.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Target Grade
            </label>
            <select
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              value={targetGrade}
              onChange={e => setTargetGrade(parseFloat(e.target.value))}
            >
              {GRADE_TARGETS.map(g => (
                <option key={g} value={g}>{formatGrade(g)} — {getGradeLabel(g)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Known scores */}
        <div className="rounded-xl bg-card p-4 card-shadow">
          <h3 className="mb-1 text-sm font-semibold text-card-foreground">
            Enter your known scores
          </h3>
          <p className="mb-4 text-[10px] text-muted-foreground">
            Leave blank the assessment you want to solve for, then select it below.
          </p>
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
                    placeholder={validSolveFor === a.name ? 'Solving for this...' : '0–100'}
                    disabled={validSolveFor === a.name}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:bg-muted"
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
              </div>
            ))}
          </div>

          <div className="mt-4">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Solve for
            </label>
            <select
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              value={validSolveFor}
              onChange={e => setSolveFor(e.target.value)}
            >
              <option value="">Select assessment...</option>
              {subject.assessments.map(a => (
                <option key={a.name} value={a.name}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Result */}
        {prediction && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-card p-5 card-shadow text-center"
          >
            {prediction.type === 'missing' && (
              <p className="text-sm text-muted-foreground">
                Fill in all other assessment scores first.
              </p>
            )}
            {prediction.type === 'impossible' && (
              <div>
                <p className="text-sm font-semibold text-destructive">
                  Target is not achievable
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  You would need {prediction.required.toFixed(1)}% which exceeds 100%.
                </p>
              </div>
            )}
            {prediction.type === 'ok' && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  You need at least
                </p>
                <p className="mt-1 text-4xl font-bold text-primary tabular-nums">
                  {prediction.required.toFixed(1)}%
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  in <span className="font-semibold text-card-foreground">{validSolveFor}</span> to
                  get a <span className="font-semibold text-card-foreground">{formatGrade(targetGrade)}</span>
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
