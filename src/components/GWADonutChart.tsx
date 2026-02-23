import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { SUBJECTS, SUBJECT_COLORS } from '@/lib/subjectConfig';
import { calculateFinalGrade, transmuteGWA, formatGrade, getGradeLabel } from '@/lib/gradeUtils';
import { GradeMap } from '@/hooks/useGrades';
import { motion } from 'framer-motion';

interface Props {
  grades: GradeMap;
}

export default function GWADonutChart({ grades }: Props) {
  const subjectsWithGrades = SUBJECTS.map(s => {
    const g = grades[s.id];
    const hasBoth = g?.previousGrade != null && g?.tentativeGrade != null;
    const final = hasBoth
      ? calculateFinalGrade(g.tentativeGrade!, g.previousGrade!)
      : null;
    return { ...s, final, color: SUBJECT_COLORS[s.id] };
  });

  const validGrades = subjectsWithGrades.filter(s => s.final !== null);
  
  const rawGWA = validGrades.length > 0
    ? validGrades.reduce((sum, s) => sum + s.final!, 0) / validGrades.length
    : 0;
  
  const transmutedGWA = validGrades.length > 0 ? transmuteGWA(rawGWA) : 0;

  const chartData = validGrades.length > 0
    ? validGrades.map(s => ({
        name: s.name,
        value: s.final!,
        color: `hsl(${s.color})`,
      }))
    : SUBJECTS.map(s => ({
        name: s.name,
        value: 1,
        color: `hsl(${SUBJECT_COLORS[s.id]} / 0.2)`,
      }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative mx-auto w-full max-w-[280px]"
    >
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={120}
            paddingAngle={2}
            dataKey="value"
            animationBegin={0}
            animationDuration={800}
            stroke="none"
          >
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          {validGrades.length > 0 && (
            <Tooltip
              content={({ payload }) => {
                if (!payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="rounded-lg bg-card px-3 py-2 text-sm card-shadow border border-border">
                    <p className="font-semibold text-card-foreground">{d.name}</p>
                    <p className="text-muted-foreground">{formatGrade(d.value)}</p>
                  </div>
                );
              }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>

      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          GWA
        </span>
        <span className="text-4xl font-bold text-foreground tabular-nums">
          {validGrades.length > 0 ? formatGrade(transmutedGWA) : '—'}
        </span>
        {validGrades.length > 0 && (
          <span
            className="mt-0.5 text-xs font-medium"
            style={{ color: `hsl(${getGradeColorHSL(transmutedGWA)})` }}
          >
            {getGradeLabel(transmutedGWA)}
          </span>
        )}
        {validGrades.length === 0 && (
          <span className="mt-1 text-[10px] text-muted-foreground">
            Enter grades below
          </span>
        )}
      </div>
    </motion.div>
  );
}

function getGradeColorHSL(grade: number): string {
  if (grade <= 1.50) return 'var(--grade-excellent)';
  if (grade <= 2.00) return 'var(--grade-good)';
  if (grade <= 2.75) return 'var(--grade-average)';
  return 'var(--grade-poor)';
}
