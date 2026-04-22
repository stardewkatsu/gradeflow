import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { SUBJECTS, SUBJECT_COLORS } from '@/lib/subjectConfig';
import { calculateFinalGrade, transmuteGWA, getGradeLabel } from '@/lib/gradeUtils';
import { GradeMap } from '@/hooks/useGrades';
import { motion } from 'framer-motion';

interface Props {
  grades: GradeMap;
}

export default function GWADonutChart({ grades }: Props) {
  const subjectsWithGrades = SUBJECTS.map(s => {
    const g = grades[s.id];
    const hasBoth = g?.previousGrade != null && g?.tentativeGrade != null;
    const rawFinal = hasBoth
      ? calculateFinalGrade(g.tentativeGrade!, g.previousGrade!)
      : null;
    const final = rawFinal != null ? transmuteGWA(rawFinal) : null;
    return { ...s, final, color: SUBJECT_COLORS[s.id] };
  });

  const validGrades = subjectsWithGrades.filter(s => s.final !== null);

  const rawGWA = validGrades.length > 0
    ? validGrades.reduce((sum, s) => sum + s.final!, 0) / validGrades.length
    : 0;

  const chartData = validGrades.length > 0
    ? validGrades.map(s => ({
        name: s.name,
        value: s.final!,
        color: `hsl(${s.color})`,
      }))
    : SUBJECTS.map(s => ({
        name: s.name,
        value: 1,
        color: `hsl(${SUBJECT_COLORS[s.id]} / 0.12)`,
      }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative mx-auto w-full max-w-[220px]"
    >
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={68}
            outerRadius={95}
            paddingAngle={4}
            dataKey="value"
            animationBegin={100}
            animationDuration={900}
            stroke="none"
            cornerRadius={6}
          >
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-muted-foreground/60">
          GWA
        </span>
        <span className="text-4xl font-normal text-foreground tabular-nums" style={{ fontFamily: "'Instrument Serif', serif" }}>
          {validGrades.length > 0 ? rawGWA.toFixed(2) : '—'}
        </span>
        {validGrades.length > 0 && (
          <span
            className="text-[10px] font-semibold tracking-wide"
            style={{ color: `hsl(${gradeHSL(rawGWA)})` }}
          >
            {getGradeLabel(rawGWA)}
          </span>
        )}
        {validGrades.length === 0 && (
          <span className="text-[9px] text-muted-foreground/50 italic mt-0.5">
            add grades below ✨
          </span>
        )}
      </div>
    </motion.div>
  );
}

function gradeHSL(grade: number): string {
  if (grade <= 1.50) return 'var(--grade-excellent)';
  if (grade <= 2.00) return 'var(--grade-good)';
  if (grade <= 2.75) return 'var(--grade-average)';
  return 'var(--grade-poor)';
}
