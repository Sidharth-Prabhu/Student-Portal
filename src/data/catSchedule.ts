export interface CatExam {
  date: string; // e.g. "15-Jul-26"
  session: 'F.N.' | 'A.N.';
  day: string; // e.g. "Wednesday"
  courseCode: string;
  courseTitle: string;
}

export const catSchedule: CatExam[] = [
  { date: '15-Jul-26', session: 'F.N.', day: 'Wednesday', courseCode: 'AD23V12', courseTitle: 'Big Data Analytics' },
  { date: '15-Jul-26', session: 'A.N.', day: 'Wednesday', courseCode: 'MX23511', courseTitle: 'Disaster Risk Reduction and Management' },
  { date: '16-Jul-26', session: 'F.N.', day: 'Thursday', courseCode: 'AD23511', courseTitle: 'Deep Learning' },
  { date: '16-Jul-26', session: 'A.N.', day: 'Thursday', courseCode: 'AD23532', courseTitle: 'Data Exploration and Visualization' },
  { date: '17-Jul-26', session: 'F.N.', day: 'Friday', courseCode: 'CB23531', courseTitle: 'Business Analytics' },
  { date: '17-Jul-26', session: 'A.N.', day: 'Friday', courseCode: 'AD23V15', courseTitle: 'Image and Video Analytics' },
  { date: '18-Jul-26', session: 'F.N.', day: 'Saturday', courseCode: 'CS23511', courseTitle: 'Computer Networks' }
];
