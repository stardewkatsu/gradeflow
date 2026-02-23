export interface Assessment {
  name: string;
  weight: number;
}

export interface SubjectConfig {
  id: string;
  name: string;
  units: number;
  assessments: Assessment[];
}

export const SUBJECTS: SubjectConfig[] = [
  {
    id: 'chemistry',
    name: 'Chemistry',
    units: 1,
    assessments: [
      { name: 'Quiz/FA', weight: 0.25 },
      { name: 'LT/SA', weight: 0.35 },
      { name: 'AA/LA', weight: 0.40 },
    ],
  },
  {
    id: 'physics',
    name: 'Physics',
    units: 1,
    assessments: [
      { name: 'Quiz/FA', weight: 0.25 },
      { name: 'AA', weight: 0.25 },
      { name: 'LT1', weight: 0.25 },
      { name: 'LT2', weight: 0.25 },
    ],
  },
  {
    id: 'biology',
    name: 'Biology',
    units: 1,
    assessments: [
      { name: 'Final LT', weight: 0.25 },
      { name: 'LT1/LT2', weight: 0.30 },
      { name: 'Quiz/FA', weight: 0.25 },
      { name: 'AA', weight: 0.20 },
    ],
  },
  {
    id: 'math',
    name: 'Math',
    units: 1,
    assessments: [
      { name: 'Quiz/FA', weight: 0.25 },
      { name: 'SW/HW', weight: 0.05 },
      { name: 'LT1', weight: 0.25 },
      { name: 'LT2', weight: 0.25 },
      { name: 'AA', weight: 0.20 },
    ],
  },
  {
    id: 'statistics',
    name: 'Statistics',
    units: 1,
    assessments: [
      { name: 'Quiz/FA', weight: 0.20 },
      { name: 'Mini Tasks', weight: 0.05 },
      { name: 'LA', weight: 0.25 },
      { name: 'Project', weight: 0.25 },
      { name: 'LT', weight: 0.25 },
    ],
  },
  {
    id: 'social-science',
    name: 'Social Science',
    units: 1,
    assessments: [
      { name: 'Quiz/FA', weight: 0.25 },
      { name: 'LT', weight: 0.35 },
      { name: 'AA', weight: 0.40 },
    ],
  },
  {
    id: 'english',
    name: 'English',
    units: 1,
    assessments: [
      { name: 'Quiz/FA', weight: 0.25 },
      { name: 'LT', weight: 0.35 },
      { name: 'AA', weight: 0.40 },
    ],
  },
  {
    id: 'filipino',
    name: 'Filipino',
    units: 1,
    assessments: [
      { name: 'Quiz/FA', weight: 0.25 },
      { name: 'LT', weight: 0.35 },
      { name: 'AA', weight: 0.40 },
    ],
  },
  {
    id: 'pehm',
    name: 'PEHM',
    units: 1,
    assessments: [
      { name: 'Overall Percentage', weight: 1.0 },
    ],
  },
  {
    id: 'computer-science',
    name: 'Computer Science',
    units: 1,
    assessments: [
      { name: 'Overall Percentage', weight: 1.0 },
    ],
  },
];

export const SUBJECT_COLORS: Record<string, string> = {
  'chemistry': '262 83% 58%',
  'physics': '217 91% 60%',
  'biology': '152 69% 41%',
  'math': '38 92% 50%',
  'statistics': '340 82% 52%',
  'social-science': '25 95% 53%',
  'english': '187 92% 41%',
  'filipino': '326 78% 60%',
  'pehm': '173 80% 40%',
  'computer-science': '258 90% 66%',
};

export function getSubjectById(id: string): SubjectConfig | undefined {
  return SUBJECTS.find(s => s.id === id);
}
