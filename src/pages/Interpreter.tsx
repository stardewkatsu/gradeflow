import { SUBJECTS, SUBJECT_COLORS } from '@/lib/subjectConfig';
import { calculateFinalGrade, formatGrade, getGradeLabel } from '@/lib/gradeUtils';
import { useGrades } from '@/hooks/useGrades';
import { useGWASetContext } from '@/contexts/GWASetContext';
import { AlertTriangle, TrendingDown, Star } from 'lucide-react';

export default function Interpreter() {
  const { activeSetId } = useGWASetContext();
  const { grades } = useGrades(activeSetId);

  const analyzed = SUBJECTS.map(s => {
    const g = grades[s.id];
    const hasBoth = g?.previousGrade != null && g?.tentativeGrade != null;
    const final = hasBoth ? calculateFinalGrade(g.tentativeGrade!, g.previousGrade!) : null;
    const diff = hasBoth ? g.tentativeGrade! - g.previousGrade! : null;
    return { ...s, previous: g?.previousGrade ?? null, tentative: g?.tentativeGrade ?? null, final, diff, color: SUBJECT_COLORS[s.id] };
  }).filter(s => s.final !== null);

  const failing = analyzed.filter(s => s.final! >= 3.0);
  const declining = analyzed.filter(s => s.diff !== null && s.diff > 0 && s.final! < 3.0);
  const lowest = [...analyzed].sort((a, b) => b.final! - a.final!).slice(0, 3);
  const best = [...analyzed].sort((a, b) => a.final! - b.final!).slice(0, 3);

  if (analyzed.length === 0) {
    return (
      <div className="min-h-screen pb-24">
        <header className="px-4 pt-14 pb-2">
          <h1 className="text-[28px] font-bold tracking-tight text-foreground">Insights</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">What to focus on</p>
        </header>
        <div className="px-4 pt-10 text-center">
          <p className="text-[15px] text-muted-foreground">Add grades on the dashboard first</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="px-4 pt-14 pb-2">
        <h1 className="text-[28px] font-bold tracking-tight text-foreground">Insights</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">What to focus on</p>
      </header>

      <div className="px-4 pt-3 space-y-3">
        {failing.length > 0 && (
          <Section icon={<AlertTriangle className="h-4 w-4 text-destructive" />} title="Needs Attention">
            {failing.map((s, i) => <SubjectRow key={s.id} s={s} i={i} />)}
          </Section>
        )}
        {declining.length > 0 && (
          <Section icon={<TrendingDown className="h-4 w-4 text-grade-average" />} title="Declining">
            {declining.map((s, i) => <SubjectRow key={s.id} s={s} i={i} showDiff />)}
          </Section>
        )}
        <Section icon={<TrendingDown className="h-4 w-4 text-muted-foreground" />} title="Lowest Grades">
          {lowest.map((s, i) => <SubjectRow key={s.id} s={s} i={i} />)}
        </Section>
        <Section icon={<Star className="h-4 w-4 text-primary" />} title="Strongest">
          {best.map((s, i) => <SubjectRow key={s.id} s={s} i={i} />)}
        </Section>
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="card-ios p-4">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <span className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide">{title}</span>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function SubjectRow({ s, i, showDiff }: { s: any; i: number; showDiff?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2.5">
        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: `hsl(${s.color})` }} />
        <span className="text-[15px] text-foreground">{s.name}</span>
      </div>
      <div className="flex items-center gap-2">
        {showDiff && s.diff != null && (
          <span className="text-[11px] text-grade-average">+{s.diff.toFixed(2)}</span>
        )}
        <span className="text-[15px] font-semibold tabular-nums text-foreground">
          {formatGrade(s.final!)}
        </span>
        <span className="text-[11px] text-muted-foreground">{getGradeLabel(s.final!)}</span>
      </div>
    </div>
  );
}
