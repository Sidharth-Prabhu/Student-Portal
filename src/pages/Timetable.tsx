import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Zap, 
  SkipForward,
  Info
} from 'lucide-react';
import { timetable, timeSlots, days } from '../data/timetable';
import { clsx } from 'clsx';

const Timetable: React.FC = () => {
  const [currentPeriod, setCurrentPeriod] = useState('Loading...');
  const [nextPeriod, setNextPeriod] = useState('Loading...');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState('');

  useEffect(() => {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = dayNames[new Date().getDay()];
    setSelectedDay(days.includes(today) ? today : "Monday");

    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    updatePeriods();
    return () => clearInterval(timer);
  }, [currentTime]);

  const updatePeriods = () => {
    const now = new Date();
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = dayNames[now.getDay()];
    
    if (today === "Saturday" || today === "Sunday") {
      setCurrentPeriod("Weekend");
      setNextPeriod("Monday Morning");
      return;
    }

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const todaySchedule = timetable[today];

    const slotMinutes = [
      { start: 480, end: 530 },  // 8:00–8:50
      { start: 530, end: 580 },  // 8:50–9:40
      { start: 580, end: 610 },  // 9:40–10:10 (Break)
      { start: 610, end: 660 },  // 10:10–11:00
      { start: 660, end: 710 },  // 11:00–11:50
      { start: 710, end: 760 },  // 11:50–12:40
      { start: 760, end: 810 },  // 12:40–1:30 (Lunch)
      { start: 810, end: 855 },  // 1:30–2:15
      { start: 855, end: 900 }   // 2:15–3:00
    ];

    let found = false;
    for (let i = 0; i < slotMinutes.length; i++) {
      if (currentMinutes >= slotMinutes[i].start && currentMinutes < slotMinutes[i].end) {
        setCurrentPeriod(todaySchedule[i]);
        setNextPeriod(i + 1 < todaySchedule.length ? todaySchedule[i+1] : "End of Day");
        found = true;
        break;
      }
    }

    if (!found) {
      if (currentMinutes < 480) {
        setCurrentPeriod("Not Started");
        setNextPeriod(todaySchedule[0]);
      } else {
        setCurrentPeriod("End of Day");
        setNextPeriod("Tomorrow");
      }
    }
  };

  const handleDownload = () => {
     window.open('/timetable.png', '_blank');
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-8">
      {/* Live Status Cards */}
      <section className="grid grid-cols-2 gap-4">
        <div className="bg-bg-card border border-border-color rounded-3xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-accent-blue/10 blur-xl rounded-full"></div>
          <div className="relative z-10 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-blue/10 flex items-center justify-center text-accent-blue">
              <Zap size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-text-secondary tracking-widest">Current</p>
              <p className="text-sm font-bold truncate leading-tight">{currentPeriod}</p>
            </div>
          </div>
        </div>
        <div className="bg-bg-card border border-border-color rounded-3xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-accent-purple/10 blur-xl rounded-full"></div>
          <div className="relative z-10 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-purple/10 flex items-center justify-center text-accent-purple">
              <SkipForward size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-text-secondary tracking-widest">Next</p>
              <p className="text-sm font-bold truncate leading-tight">{nextPeriod}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Day Selector - Horizontal Scroll */}
      <section className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar px-1">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={clsx(
              "px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 border",
              selectedDay === day 
                ? "bg-accent-blue border-accent-blue text-white shadow-lg shadow-accent-blue/20" 
                : "bg-bg-card border-border-color text-text-secondary"
            )}
          >
            {day}
          </button>
        ))}
      </section>

      {/* Schedule List */}
      <section className="space-y-3">
        {selectedDay && timetable[selectedDay].map((subject, idx) => {
          const isBreak = subject === "Break" || subject === "Lunch";
          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={`${selectedDay}-${idx}`}
              className={clsx(
                "flex items-center gap-4 p-4 rounded-2xl border transition-all shadow-sm",
                isBreak 
                  ? "bg-bg-secondary/30 border-dashed border-border-color/50 opacity-60" 
                  : "bg-bg-card border-border-color hover:border-accent-blue/50"
              )}
            >
              <div className="w-10 text-center shrink-0">
                <p className="text-xs font-black text-accent-blue">{idx + 1}</p>
                <p className="text-[8px] uppercase font-bold text-text-secondary tracking-tighter">{timeSlots[idx].split('–')[0]}</p>
              </div>
              
              <div className="h-8 w-[1px] bg-border-color"></div>
              
              <div className="flex-grow">
                <p className={clsx("text-sm font-bold leading-tight", isBreak && "italic")}>{subject}</p>
                {!isBreak && <p className="text-[10px] text-text-secondary mt-0.5 font-medium">{timeSlots[idx]}</p>}
              </div>
            </motion.div>
          );
        })}
      </section>

      {/* Download Button */}
      <button 
        onClick={handleDownload}
        className="w-full py-4 bg-bg-card border border-border-color rounded-3xl flex items-center justify-center gap-3 text-sm font-bold active:scale-[0.98] transition-all shadow-lg"
      >
        <Download size={18} className="text-accent-blue" />
        Download Full View
      </button>

      {/* Tip */}
      <div className="bg-bg-secondary/20 rounded-2xl p-4 flex items-start gap-3 border border-border-color/30">
        <Info size={16} className="text-accent-blue shrink-0 mt-0.5" />
        <p className="text-[10px] text-text-secondary leading-normal font-medium italic">
          Schedule adapts to the current day automatically. Click any day to view its specific periods.
        </p>
      </div>
    </div>
  );
};

export default Timetable;
