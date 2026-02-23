export function percentToGrade(percent: number): number {
  if (percent >= 96) return 1.00;
  if (percent >= 90) return 1.25;
  if (percent >= 84) return 1.50;
  if (percent >= 78) return 1.75;
  if (percent >= 72) return 2.00;
  if (percent >= 66) return 2.25;
  if (percent >= 60) return 2.50;
  if (percent >= 55) return 2.75;
  if (percent >= 50) return 3.00;
  if (percent >= 40) return 4.00;
  return 5.00;
}

export function transmuteGWA(raw: number): number {
  if (raw <= 1.125) return 1.00;
  if (raw <= 1.375) return 1.25;
  if (raw <= 1.625) return 1.50;
  if (raw <= 1.875) return 1.75;
  if (raw <= 2.125) return 2.00;
  if (raw <= 2.375) return 2.25;
  if (raw <= 2.625) return 2.50;
  if (raw <= 2.875) return 2.75;
  if (raw <= 3.500) return 3.00;
  if (raw <= 4.500) return 4.00;
  return 5.00;
}

export function calculateFinalGrade(tentative: number, previous: number): number {
  return (tentative * 2 + previous) / 3;
}

export function calculateGWA(grades: { final: number; units: number }[]): number {
  const totalUnits = grades.reduce((sum, g) => sum + g.units, 0);
  if (totalUnits === 0) return 0;
  return grades.reduce((sum, g) => sum + g.final * g.units, 0) / totalUnits;
}

export function getGradeColor(grade: number): string {
  if (grade <= 1.50) return 'var(--grade-excellent)';
  if (grade <= 2.00) return 'var(--grade-good)';
  if (grade <= 2.75) return 'var(--grade-average)';
  return 'var(--grade-poor)';
}

export function getGradeLabel(grade: number): string {
  if (grade <= 1.50) return 'Excellent';
  if (grade <= 2.00) return 'Good';
  if (grade <= 2.75) return 'Average';
  if (grade <= 3.00) return 'Passing';
  return 'Failing';
}

export function formatGrade(grade: number): string {
  return grade.toFixed(2);
}
