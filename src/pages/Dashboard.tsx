import { SUBJECTS, SUBJECT_COLORS } from '@/lib/subjectConfig';
import { calculateFinalGrade, transmuteGWA, formatGrade } from '@/lib/gradeUtils';
import { useGrades } from '@/hooks/useGrades';
import GWADonutChart from '@/components/GWADonutChart';
import { motion } from 'framer-motion';

const GRADE_OPTIONS = [1.00, 1.25, 1.50, 1.75, 2.00, 2.25, 2.50, 2.75, 3.00, 4.00, 5.00];

export default function Dashboard() {
  const { grades, updateGrade } = useGrades();

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="gwa-gradient px-4 pb-8 pt-12 text-center">
        <h1 className="text-xl font-bold text-primary-foreground tracking-tight">
          GradeFlow
        </h1>
        <p className="mt-1 text-xs text-primary-foreground/70">
          Your GWA at a glance
        </p>
      </header>

      {/* Chart Card */}
      <div className="-mt-4 px-4">
        <div className="rounded-2xl bg-card p-4 card-shadow">
          <GWADonutChart grades={grades} />
        </div>
      </div>

      {/* Subject List */}
      <div className="mt-6 px-4">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Subjects
        </h2>
        <div className="space-y-3">
          {SUBJECTS.map((subject, i) => {
            const g = grades[subject.id];
            const hasBoth = g?.previousGrade != null && g?.tentativeGrade != null;
            const final = hasBoth
              ? calculateFinalGrade(g.tentativeGrade!, g.previousGrade!)
              : null;
            const transmuted = final != null ? transmuteGWA(final) : null;

            return (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-xl bg-card p-4 card-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: `hsl(${SUBJECT_COLORS[subject.id]})` }}
                    />
                    <span className="text-sm font-semibold text-card-foreground">
                      {subject.name}
                    </span>
                  </div>
                  {transmuted != null && (
                    <span className="text-lg font-bold tabular-nums text-card-foreground">
                      {formatGrade(transmuted)}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      Previous (1/3)
                    </label>
                    <select
                      className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      value={g?.previousGrade ?? ''}
                      onChange={e => {
                        const v = e.target.value;
                        updateGrade(subject.id, 'previousGrade', v ? parseFloat(v) : null);
                      }}
                    >
                      <option value="">—</option>
                      {GRADE_OPTIONS.map(g => (
                        <option key={g} value={g}>{formatGrade(g)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      Tentative (2/3)
                    </label>
                    <select
                      className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      value={g?.tentativeGrade ?? ''}
                      onChange={e => {
                        const v = e.target.value;
                        updateGrade(subject.id, 'tentativeGrade', v ? parseFloat(v) : null);
                      }}
                    >
                      <option value="">—</option>
                      {GRADE_OPTIONS.map(g => (
                        <option key={g} value={g}>{formatGrade(g)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
