import { useState, useEffect, useMemo } from 'react';
import { timetable } from '../data/timetable';

export interface PeriodInfo {
  currentPeriod: string;
  nextPeriod: string;
  activePeriodIndex: number | null;
  overallProgress: number;
}

export const useCurrentPeriods = (): PeriodInfo => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return useMemo(() => {
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
    if (!todaySchedule) {
      return {
        currentPeriod: "No Classes",
        nextPeriod: "No Classes",
        activePeriodIndex: null,
        overallProgress: 0
      };
    }

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
};
