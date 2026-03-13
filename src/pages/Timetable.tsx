import React, { useState, useEffect, useMemo } from 'react';
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
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(() => {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = dayNames[new Date().getDay()];
    return days.includes(today) ? today : "Monday";
  });

  const { currentPeriod, nextPeriod, activePeriodIndex, overallProgress } = useMemo(() => {
    const now = currentTime;
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = dayNames[now.getDay()];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const startMins = 480; // 8:00 AM
    const endMins = 900;   // 3:00 PM
    const totalMins = endMins - startMins;
    
    const progress = Math.min(100, Math.max(0, ((currentMinutes - startMins) / totalMins) * 100));
    
    if (today === "Saturday" || today === "Sunday") {
      return {
        currentPeriod: "Weekend",
        nextPeriod: "Monday Morning",
        activePeriodIndex: null,
        overallProgress: 0
      };
    }

    const todaySchedule = timetable[today];
    const slotMinutes = [
      { start: 480, end: 530 },
      { start: 530, end: 580 },
      { start: 580, end: 610 },
      { start: 610, end: 660 },
      { start: 660, end: 710 },
      { start: 710, end: 760 },
      { start: 760, end: 810 },
      { start: 810, end: 855 },
      { start: 855, end: 900 }
    ];

    let activeIndex: number | null = null;
    let current = "End of Day";
    let next = "Tomorrow";

    for (let i = 0; i < slotMinutes.length; i++) {
      if (currentMinutes >= slotMinutes[i].start && currentMinutes < slotMinutes[i].end) {
        current = todaySchedule[i];
        next = i + 1 < todaySchedule.length ? todaySchedule[i+1] : "End of Day";
        activeIndex = i;
        break;
      }
    }

    if (activeIndex === null && currentMinutes < 480) {
      current = "Not Started";
      next = todaySchedule[0];
    }

    return {
      currentPeriod: current,
      nextPeriod: next,
      activePeriodIndex: activeIndex,
      overallProgress: progress
    };
  }, [currentTime]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleDownload = () => {
     window.open('/timetable.png', '_blank');
  };

  const isToday = selectedDay === ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()];

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-8 px-4">
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

      {/* Schedule List with Global Progress Bar */}
      <div className="flex gap-4 items-stretch">
        {/* Whole Day Progress Bar */}
        <div className="w-1.5 bg-bg-card border border-border-color rounded-full relative shrink-0 my-1">
          {isToday && (
            <>
              <motion.div 
                className="absolute top-0 left-0 w-full bg-accent-blue rounded-full z-10"
                initial={false}
                animate={{ height: `${overallProgress}%` }}
                transition={{ type: 'spring', stiffness: 50, damping: 20 }}
              />
              {/* Glowing Indicator at the tip */}
              <motion.div 
                className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-accent-blue rounded-full z-20 shadow-[0_0_15px_rgba(59,130,246,0.8)]"
                initial={false}
                animate={{ 
                  top: `${overallProgress}%`,
                  scale: [1, 1.4, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ 
                  top: { type: 'spring', stiffness: 50, damping: 20 },
                  scale: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                  opacity: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                }}
              />
              {/* Extra Background Glow */}
              <motion.div 
                className="absolute top-0 left-0 w-full bg-accent-blue/20 rounded-full blur-sm"
                initial={false}
                animate={{ height: `${overallProgress}%` }}
                transition={{ type: 'spring', stiffness: 50, damping: 20 }}
              />
            </>
          )}
        </div>

        <section className="flex-grow space-y-3">
          {selectedDay && timetable[selectedDay].map((subject, idx) => {
            const isBreak = subject === "Break" || subject === "Lunch";
            const isActive = isToday && idx === activePeriodIndex;

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
                    : isActive
                      ? "bg-accent-blue/5 border-accent-blue ring-1 ring-accent-blue/50 shadow-md scale-[1.02]"
                      : "bg-bg-card border-border-color hover:border-accent-blue/50"
                )}
              >
                <div className="w-10 text-center shrink-0">
                  <p className={clsx("text-xs font-black", isActive ? "text-accent-blue" : "text-accent-blue/60")}>{idx + 1}</p>
                  <p className="text-[8px] uppercase font-bold text-text-secondary tracking-tighter">{timeSlots[idx].split('–')[0]}</p>
                </div>
                
                <div className={clsx("h-8 w-[1px]", isActive ? "bg-accent-blue/50" : "bg-border-color")}></div>
                
                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    <p className={clsx("text-sm font-bold leading-tight", isBreak && "italic")}>{subject}</p>
                    {isActive && (
                      <span className="flex h-1.5 w-1.5 rounded-full bg-accent-blue animate-pulse"></span>
                    )}
                  </div>
                  {!isBreak && <p className="text-[10px] text-text-secondary mt-0.5 font-medium">{timeSlots[idx]}</p>}
                </div>
              </motion.div>
            );
          })}
        </section>
      </div>

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
