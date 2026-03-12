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
  "Monday": ["DAA-CS23431(B1)/OS-CS23422(B2)", "DAA-CS23431(B1)/OS-CS23422(B2)", "Break", "DA-AD23411", "OS-CS23412", "P&S-MA23411", "Lunch", "ML-AL23411", "DAA-CS23431"],
  "Tuesday": ["ML-AL23411", "OS-CS23412", "Break", "DA-AD23411", "OS-CS23422(B1)/ML-AL23421(B2)", "OS-CS23422(B1)/ML-AL23421(B2)", "Lunch", "DAA-CS23431", "P&S-MA23411"],
  "Wednesday": ["DAA-CS23431", "ML-AL23411", "Break", "P&S-MA23411", "ESS-GE23411", "MENTORING", "Lunch", "DA-AD23421(B1)/DAA-CS23431(B2)", "DA-AD23421(B1)/DAA-CS23431(B2)"],
  "Thursday": ["OS-CS23412", "ESS-GE23411", "Break", "DA-AD23411", "P&S-MA23411", "DAA-CS23431", "Lunch", "P&S-MA23411", "ML-AL23411"],
  "Friday": ["ML-AL23421(B1)/DA-AD23421(B2)", "ML-AL23421(B1)/DA-AD23421(B2)", "Break", "DA-AD23411", "P&S-MA23411", "OS-CS23412", "Lunch", "PLACEMENT", "ESS-GE23411"]
};
