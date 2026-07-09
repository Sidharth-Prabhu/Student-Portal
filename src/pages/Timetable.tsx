import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Zap, 
  SkipForward,
  Info
} from 'lucide-react';
import { timetable, timeSlots, days } from '../data/timetable';
import { clsx } from 'clsx';
import { useCurrentPeriods } from '../hooks/useCurrentPeriods';

const Timetable: React.FC = () => {
  const { currentPeriod, nextPeriod, activePeriodIndex, overallProgress } = useCurrentPeriods();
  const [selectedDay, setSelectedDay] = useState(() => {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = dayNames[new Date().getDay()];
    return days.includes(today) ? today : "Monday";
  });

  const handleDownload = () => {
     window.open('/timetable.png', '_blank');
  };

  const isToday = selectedDay === ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()];

  return (
    <div className="space-y-6 max-w-lg md:max-w-5xl mx-auto pb-8">
      <h1 className="text-2xl font-black text-text-primary px-2 pt-2">Schedule</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left column */}
        <div className="md:col-span-5 space-y-6">
          {/* Live Status Cards */}
          <section className="grid grid-cols-2 gap-4">
            <div className="neu-flat rounded-3xl p-5 relative overflow-hidden border border-border-color/10">
              <div className="absolute top-0 right-0 w-12 h-12 bg-accent-blue/5 blur-xl rounded-full"></div>
              <div className="relative z-10 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl neu-inset flex items-center justify-center text-accent-blue">
                  <Zap size={18} />
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold text-text-secondary tracking-wider">Current</p>
                  <p className="text-sm font-bold truncate leading-tight mt-1 text-text-primary">{currentPeriod}</p>
                </div>
              </div>
            </div>
            <div className="neu-flat rounded-3xl p-5 relative overflow-hidden border border-border-color/10">
              <div className="absolute top-0 right-0 w-12 h-12 bg-accent-purple/5 blur-xl rounded-full"></div>
              <div className="relative z-10 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl neu-inset flex items-center justify-center text-accent-purple">
                  <SkipForward size={18} />
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold text-text-secondary tracking-wider">Next</p>
                  <p className="text-sm font-bold truncate leading-tight mt-1 text-text-primary">{nextPeriod}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Day Selector - Horizontal Scroll */}
          <section className="flex items-center gap-3.5 overflow-x-auto pb-3.5 no-scrollbar px-1">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={clsx(
                  "px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border border-border-color/10",
                  selectedDay === day 
                    ? "neu-inset text-accent-blue font-black" 
                    : "neu-flat text-text-secondary hover:text-text-primary"
                )}
              >
                {day}
              </button>
            ))}
          </section>

          {/* Download Button */}
          <button 
            onClick={handleDownload}
            className="w-full py-4 neu-btn rounded-3xl flex items-center justify-center gap-3 text-sm font-bold active:scale-[0.98] transition-all border border-border-color/10 text-accent-blue"
          >
            <Download size={18} />
            Download Full View
          </button>

          {/* Tip */}
          <div className="neu-inset rounded-2xl p-4 flex items-start gap-3 border border-border-color/5">
            <Info size={15} className="text-accent-blue shrink-0 mt-0.5" />
            <p className="text-[9px] text-text-secondary leading-normal font-medium italic">
              Schedule adapts to the current day automatically. Click any day to view its specific periods.
            </p>
          </div>
        </div>

        {/* Right column */}
        <div className="md:col-span-7 space-y-4">
          {/* Schedule List with Global Progress Bar */}
          <div className="flex gap-4 items-stretch">
            {/* Whole Day Progress Bar */}
            <div className="w-1.5 neu-inset rounded-full relative shrink-0 my-1 border-0">
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
                    className="absolute top-0 left-0 w-full bg-accent-blue/25 rounded-full blur-sm"
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
                      "flex items-center gap-4 p-4 rounded-2xl border transition-all",
                      isBreak 
                        ? "neu-flat opacity-60 border-dashed border-border-color/30" 
                        : isActive
                          ? "neu-flat border-accent-blue/40 ring-1 ring-accent-blue/30 scale-[1.01]"
                          : "neu-flat border-border-color/10 hover:border-accent-blue/30"
                    )}
                  >
                    <div className="w-10 text-center shrink-0">
                      <p className={clsx("text-xs font-black", isActive ? "text-accent-blue" : "text-accent-blue/70")}>{idx + 1}</p>
                      <p className="text-[8px] uppercase font-bold text-text-secondary tracking-tight mt-0.5">{timeSlots[idx].split('–')[0]}</p>
                    </div>
                    
                    <div className={clsx("h-8 w-[1px]", isActive ? "bg-accent-blue/45" : "bg-text-secondary/20")}></div>
                    
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={clsx("text-sm font-bold leading-tight text-text-primary", isBreak && "italic text-text-secondary")}>{subject}</p>
                        {isActive && (
                          <span className="flex h-1.5 w-1.5 rounded-full bg-accent-blue animate-pulse"></span>
                        )}
                      </div>
                      {!isBreak && <p className="text-[9px] text-text-secondary mt-1 font-medium">{timeSlots[idx]}</p>}
                    </div>
                  </motion.div>
                );
              })}
            </section>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Timetable;
