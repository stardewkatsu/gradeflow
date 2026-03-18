import { SUBJECTS, SUBJECT_COLORS } from '@/lib/subjectConfig';
import { calculateFinalGrade, formatGrade, getGradeLabel } from '@/lib/gradeUtils';
import { useGrades } from '@/hooks/useGrades';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingDown, TrendingUp, Star } from 'lucide-react';

export default function Interpreter() {
  const { grades } = useGrades(null);

  const analyzed = SUBJECTS.map(s => {
    const g = grades[s.id];
    const hasBoth = g?.previousGrade != null && g?.tentativeGrade != null;
    const final = hasBoth ? calculateFinalGrade(g.tentativeGrade!, g.previousGrade!) : null;
    const diff = hasBoth ? g.tentativeGrade! - g.previousGrade! : null;
    return {
      ...s,
      previous: g?.previousGrade ?? null,
      tentative: g?.tentativeGrade ?? null,
      final,
      diff,
      color: SUBJECT_COLORS[s.id],
    };
  }).filter(s => s.final !== null);

  const failing = analyzed.filter(s => s.final! >= 3.0);
  const declining = analyzed.filter(s => s.diff !== null && s.diff > 0 && s.final! < 3.0);
  const lowest = [...analyzed].sort((a, b) => b.final! - a.final!).slice(0, 3);
  const best = [...analyzed].sort((a, b) => a.final! - b.final!).slice(0, 3);

  if (analyzed.length === 0) {
    return (
      <div className="min-h-screen pb-20">
        <header className="px-5 pt-14 pb-2 text-center">
          <h1 className="text-3xl text-foreground tracking-tight">Insights</h1>
          <p className="mt-0.5 text-xs text-muted-foreground italic">what to focus on</p>
        </header>
        <div className="px-5 pt-8 text-center">
          <p className="text-sm text-muted-foreground italic">add grades on the dashboard first</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="px-5 pt-14 pb-2 text-center">
        <h1 className="text-3xl text-foreground tracking-tight">Insights</h1>
        <p className="mt-0.5 text-xs text-muted-foreground italic">what to focus on</p>
      </header>

      <div className="px-5 pt-4 space-y-3">
        {/* Failing / at risk */}
        {failing.length > 0 && (
          <Section icon={<AlertTriangle className="h-3.5 w-3.5 text-destructive" />} title="Needs immediate attention">
            {failing.map((s, i) => (
              <SubjectRow key={s.id} s={s} i={i} />
            ))}
          </Section>
        )}

        {/* Declining */}
        {declining.length > 0 && (
          <Section icon={<TrendingDown className="h-3.5 w-3.5 text-grade-average" />} title="Gone down from previous">
            {declining.map((s, i) => (
              <SubjectRow key={s.id} s={s} i={i} showDiff />
            ))}
          </Section>
        )}

        {/* Weakest subjects */}
        <Section icon={<TrendingDown className="h-3.5 w-3.5 text-muted-foreground" />} title="Lowest grades">
          {lowest.map((s, i) => (
            <SubjectRow key={s.id} s={s} i={i} />
          ))}
        </Section>

        {/* Strongest */}
        <Section icon={<Star className="h-3.5 w-3.5 text-primary" />} title="Strongest subjects">
          {best.map((s, i) => (
            <SubjectRow key={s.id} s={s} i={i} />
          ))}
        </Section>
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-card p-4 card-soft"
    >
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground/70">{title}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </motion.div>
  );
}

function SubjectRow({ s, i, showDiff }: { s: any; i: number; showDiff?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: i * 0.05 }}
      className="flex items-center justify-between py-1.5"
    >
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: `hsl(${s.color})` }} />
        <span className="text-sm text-card-foreground">{s.name}</span>
      </div>
      <div className="flex items-center gap-2">
        {showDiff && s.diff != null && (
          <span className="text-[10px] text-grade-average">
            +{s.diff.toFixed(2)} ↓
          </span>
        )}
        <span className="text-sm font-medium tabular-nums text-card-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>
          {formatGrade(s.final!)}
        </span>
        <span className="text-[9px] text-muted-foreground/60">{getGradeLabel(s.final!)}</span>
      </div>
    </motion.div>
  );
}
