export interface Period {
  name: string;
  time: string;
}

export const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export const timeSlots = [
  "8:00–8:50",
  "8:50–9:40",
  "9:40–10:10",
  "10:10–11:00",
  "11:00–11:50",
  "11:50–12:40",
  "12:40–1:30",
  "1:30–2:15",
  "2:15–3:00"
];

export const timetable: Record<string, string[]> = {
  "Monday": ["DL-AD23511", "BDA-AD23V12", "Break", "CN-CS23511", "DEV-AD23532", "BA-CB23531", "Lunch", "DEV-III AIDS E", "DEV-III AIDS E"],
  "Tuesday": ["IVA-AD23V15", "DEV-AD23532", "Break", "DL-AD23511", "CN-III AIDS E", "CN-III AIDS E", "Lunch", "BA-CB23531", "Aptitude"],
  "Wednesday": ["DL-III AIDS E", "DL-III AIDS E", "Break", "IVA-AD23V15", "BA-CB23531", "BDA-AD23V12", "Lunch", "CN-CS23511", "NPTEL"],
  "Thursday": ["BA-CB23531", "CN-CS23511", "Break", "DL-AD23511", "IVA-AD23V15", "BDA-AD23V12", "Lunch", "DEV-AD23532", "Mentoring"],
  "Friday": ["BDA-AD23V12", "IVA-AD23V15", "Break", "DL-AD23511", "CN-CS23511", "DEV-AD23532", "Lunch", "BA-III AIDS E", "BA-III AIDS E"]
};
