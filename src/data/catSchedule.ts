export interface CatExam {
  date: string; // e.g. "15-Jul-26"
  session: 'F.N.' | 'A.N.';
  day: string; // e.g. "Wednesday"
  courseCode: string;
  courseTitle: string;
}

export const catSchedule: CatExam[] = [
  { date: '15-Jul-26', session: 'F.N.', day: 'Wednesday', courseCode: 'AD23V12', courseTitle: 'Big Data Analytics' },
  { date: '16-Jul-26', session: 'F.N.', day: 'Thursday', courseCode: 'MX23511', courseTitle: 'Disaster Risk Reduction and Management' },
  { date: '17-Jul-26', session: 'F.N.', day: 'Friday', courseCode: 'AD23511', courseTitle: 'Deep Learning' },
  { date: '18-Jul-26', session: 'F.N.', day: 'Saturday', courseCode: 'AD23532', courseTitle: 'Data Exploration and Visualization' },
  { date: '20-Jul-26', session: 'F.N.', day: 'Monday', courseCode: 'CB23531', courseTitle: 'Business Analytics' },
  { date: '21-Jul-26', session: 'F.N.', day: 'Tuesday', courseCode: 'AD23V15', courseTitle: 'Image and Video Analytics' },
  { date: '22-Jul-26', session: 'F.N.', day: 'Wednesday', courseCode: 'CS23511', courseTitle: 'Computer Networks' }
];
