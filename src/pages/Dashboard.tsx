import { SUBJECTS, SUBJECT_COLORS } from '@/lib/subjectConfig';
import { calculateFinalGrade, formatGrade } from '@/lib/gradeUtils';
import { useGrades } from '@/hooks/useGrades';
import { useAuth } from '@/hooks/useAuth';
import GWADonutChart from '@/components/GWADonutChart';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';

const GRADE_OPTIONS = [1.00, 1.25, 1.50, 1.75, 2.00, 2.25, 2.50, 2.75, 3.00, 4.00, 5.00];

export default function Dashboard() {
  const { grades, updateGrade } = useGrades();
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen pb-20">
      <header className="px-5 pt-14 pb-2 flex items-start justify-between">
        <div>
          <h1 className="text-3xl text-foreground tracking-tight">GradeFlow</h1>
          <p className="mt-0.5 text-xs text-muted-foreground italic">your grades, beautifully</p>
        </div>
        <button
          onClick={signOut}
          className="mt-1 flex items-center gap-1.5 rounded-xl bg-secondary/60 px-3 py-2 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="h-3 w-3" />
          out
        </button>
      </header>

      <div className="px-5 py-4">
        <GWADonutChart grades={grades} />
      </div>

      <div className="px-5">
        <p className="mb-3 text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/70">
          Subjects
        </p>
        <div className="space-y-2.5">
          {SUBJECTS.map((subject, i) => {
            const g = grades[subject.id];
            const hasBoth = g?.previousGrade != null && g?.tentativeGrade != null;
            const final = hasBoth ? calculateFinalGrade(g.tentativeGrade!, g.previousGrade!) : null;

            return (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
                className="rounded-2xl bg-card p-4 card-soft"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: `hsl(${SUBJECT_COLORS[subject.id]})` }} />
                    <span className="text-sm font-medium text-card-foreground">{subject.name}</span>
                  </div>
                  {final != null && (
                    <span className="text-xl tabular-nums text-card-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>
                      {final.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[9px] font-medium text-muted-foreground/70 tracking-wider uppercase">Previous</label>
                    <select
                      className="mt-1 w-full rounded-xl border-0 bg-secondary/60 px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 appearance-none"
                      value={g?.previousGrade ?? ''}
                      onChange={e => updateGrade(subject.id, 'previousGrade', e.target.value ? parseFloat(e.target.value) : null)}
                    >
                      <option value="">—</option>
                      {GRADE_OPTIONS.map(g => (
                        <option key={g} value={g}>{formatGrade(g)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-medium text-muted-foreground/70 tracking-wider uppercase">Tentative</label>
                    <select
                      className="mt-1 w-full rounded-xl border-0 bg-secondary/60 px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 appearance-none"
                      value={g?.tentativeGrade ?? ''}
                      onChange={e => updateGrade(subject.id, 'tentativeGrade', e.target.value ? parseFloat(e.target.value) : null)}
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
