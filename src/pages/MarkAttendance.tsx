import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, type PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { 
  Check, 
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Briefcase,
  Calendar as CalendarIcon
} from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { students } from '../data/students';
import { clsx } from 'clsx';

type AttendanceStatus = 'present' | 'absent' | 'internal_od' | 'external_od';

const StudentCard: React.FC<{
  s: typeof students[0];
  idx: number;
  status: AttendanceStatus;
  onSwipe: (regNum: string, info: PanInfo) => void;
  onClick: (regNum: string) => void;
}> = ({ s, idx, status, onSwipe, onClick }) => {
  const x = useMotionValue(0);
  const opacityLeft = useTransform(x, [50, 100], [0, 1]); 
  const opacityRight = useTransform(x, [-50, -100], [0, 1]); 
  const scaleLeft = useTransform(x, [50, 150], [0.8, 1.1]);
  const scaleRight = useTransform(x, [-50, -150], [0.8, 1.1]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-bg-secondary/20">
      <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
        <motion.div 
          style={{ opacity: opacityLeft, scale: scaleLeft }}
          className="flex items-center gap-2 text-purple-400"
        >
          <ShieldCheck size={20} />
          <span className="text-[10px] font-black uppercase whitespace-nowrap">External OD</span>
        </motion.div>
        
        <motion.div 
          style={{ opacity: opacityRight, scale: scaleRight }}
          className="flex items-center gap-2 text-blue-400"
        >
          <span className="text-[10px] font-black uppercase whitespace-nowrap">Internal OD</span>
          <Briefcase size={20} />
        </motion.div>
      </div>

      <motion.div
        drag="x"
        style={{ x }}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        onDragEnd={(_, info) => onSwipe(s.regNum, info)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.01 }}
        onClick={() => onClick(s.regNum)}
        className={clsx(
          "relative z-10 flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer select-none touch-pan-y",
          status === 'present' ? "bg-bg-card border-border-color" : 
          status === 'absent' ? "bg-red-500/5 border-red-500/30" :
          status === 'internal_od' ? "bg-blue-500/5 border-blue-500/30" :
          "bg-purple-500/5 border-purple-500/30"
        )}
      >
        <div className={clsx(
          "w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-inner border transition-colors",
          status === 'present' ? "bg-emerald-400/10 border-emerald-400/20 text-emerald-400" : 
          status === 'absent' ? "bg-red-400/20 text-red-400" :
          status === 'internal_od' ? "bg-blue-400/20 text-blue-400" :
          "bg-purple-400/20 text-purple-400"
        )}>
          {status === 'present' ? <Check size={16} /> : s.name.charAt(0)}
        </div>
        
        <div className="flex-grow min-w-0">
          <p className="font-bold text-sm truncate">{s.name}</p>
          <p className="text-[10px] text-text-secondary font-mono tracking-tighter opacity-60">{s.regNum}</p>
        </div>

        <div className={clsx(
          "px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all",
          status === 'present' ? "bg-emerald-400/10 border-emerald-400/20 text-emerald-400" : 
          status === 'absent' ? "bg-red-400/10 border-red-400/20 text-red-400" :
          status === 'internal_od' ? "bg-blue-400/10 border-blue-400/20 text-blue-400" :
          "bg-purple-400/10 border-purple-400/20 text-purple-400"
        )}>
          {status.replace('_', ' ')}
        </div>
      </motion.div>
    </div>
  );
};

const MarkAttendance: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAttendance = useCallback(async () => {
    setIsLoading(true);
    try {
      const docRef = doc(db, 'semester_4', selectedDate);
      const docSnap = await getDoc(docRef);
      
      const newAttendance: Record<string, AttendanceStatus> = {};
      students.forEach(s => newAttendance[s.regNum] = 'present');

      if (docSnap.exists()) {
        const data = docSnap.data();
        (data.absents || []).forEach((reg: string) => newAttendance[reg] = 'absent');
        (data.internal_od || []).forEach((reg: string) => newAttendance[reg] = 'internal_od');
        (data.external_od || []).forEach((reg: string) => newAttendance[reg] = 'external_od');
      }
      setAttendance(newAttendance);
    } catch (e) {
      console.error("Fetch failed", e);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const toggleStatus = (regNum: string) => {
    setAttendance(prev => {
      const current = prev[regNum];
      const next: AttendanceStatus = current === 'present' ? 'absent' : 'present';
      return { ...prev, [regNum]: next };
    });
  };

  const handleSwipe = (regNum: string, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x < -threshold) {
      setAttendance(prev => ({ ...prev, [regNum]: prev[regNum] === 'internal_od' ? 'present' : 'internal_od' }));
    } else if (info.offset.x > threshold) {
      setAttendance(prev => ({ ...prev, [regNum]: prev[regNum] === 'external_od' ? 'present' : 'external_od' }));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const absents = Object.entries(attendance).filter(([, status]) => status === 'absent').map(([reg]) => reg);
      const internal_od = Object.entries(attendance).filter(([, status]) => status === 'internal_od').map(([reg]) => reg);
      const external_od = Object.entries(attendance).filter(([, status]) => status === 'external_od').map(([reg]) => reg);

      // 1. Save to Firestore
      await setDoc(doc(db, 'semester_4', selectedDate), {
        absents,
        internal_od,
        external_od,
        updatedAt: new Date().toISOString()
      });
      
      // 2. Open WhatsApp Share
      const absentsRoll = absents.map(reg => reg.slice(-3));
      const iodRoll = internal_od.map(reg => reg.slice(-3));
      const eodRoll = external_od.map(reg => reg.slice(-3));
      const totalPresent = students.length - absents.length;

      const message = `II AIDS-E\n${selectedDate}\n\nAbsentees: ${absentsRoll.join(', ') || 'nil'}\n\nPresent Count: ${totalPresent}\n\nInternal OD: ${iodRoll.join(', ') || 'nil'}\n\nExternal OD: ${eodRoll.join(', ') || 'nil'}\n\nNo. of Absentees: ${absents.length}`;
      
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
      
      alert('Attendance saved and WhatsApp opened!');
    } catch (e) {
      console.error("Submission failed", e);
      alert('Failed to save attendance.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = useMemo(() => ({
    present: Object.values(attendance).filter(s => s === 'present').length,
    absent: Object.values(attendance).filter(s => s === 'absent').length,
    iod: Object.values(attendance).filter(s => s === 'internal_od').length,
    eod: Object.values(attendance).filter(s => s === 'external_od').length,
  }), [attendance]);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.regNum.includes(searchQuery)
  );

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-32 px-4 sm:px-0">
      {/* Header */}
      <section className="bg-bg-card border border-border-color rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <div className="flex flex-col gap-4 mb-6">
            <h1 className="text-2xl font-black">Mark Attendance</h1>
            <div 
              className="flex items-center gap-3 bg-bg-secondary p-3 rounded-2xl border border-border-color cursor-pointer active:bg-bg-secondary/80"
              onClick={(e) => {
                const input = e.currentTarget.querySelector('input');
                if (input && 'showPicker' in input) {
                  try { input.showPicker(); } catch (e) {}
                } else if (input) {
                  input.focus();
                }
              }}
            >
              <CalendarIcon size={18} className="text-accent-blue" />
              <input 
                type="date" 
                value={selectedDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-sm font-bold focus:outline-none grow color-scheme-dark cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div className="bg-bg-secondary/50 p-3 rounded-2xl border border-border-color text-center">
              <p className="text-[8px] uppercase font-black text-text-secondary tracking-widest">Present</p>
              <p className="text-lg font-black text-emerald-400">{stats.present}</p>
            </div>
            <div className="bg-bg-secondary/50 p-3 rounded-2xl border border-border-color text-center">
              <p className="text-[8px] uppercase font-black text-text-secondary tracking-widest">Absent</p>
              <p className="text-lg font-black text-red-400">{stats.absent}</p>
            </div>
            <div className="bg-bg-secondary/50 p-3 rounded-2xl border border-border-color text-center">
              <p className="text-[8px] uppercase font-black text-text-secondary tracking-widest">I-OD</p>
              <p className="text-lg font-black text-blue-400">{stats.iod}</p>
            </div>
            <div className="bg-bg-secondary/50 p-3 rounded-2xl border border-border-color text-center">
              <p className="text-[8px] uppercase font-black text-text-secondary tracking-widest">E-OD</p>
              <p className="text-lg font-black text-purple-400">{stats.eod}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Search */}
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent-blue transition-colors">
          <Search size={18} />
        </div>
        <input 
          type="text"
          placeholder="Search name or roll number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-bg-card border border-border-color rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-accent-blue transition-all shadow-lg"
        />
      </div>

      {/* Student List */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-2 mb-1">
          <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest flex items-center gap-2">
            <ChevronLeft size={10} /> Swipe for OD <ChevronRight size={10} />
          </p>
          <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">
            {filteredStudents.length} Students
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-text-secondary">
            <Loader2 className="animate-spin text-accent-blue" size={32} />
            <p className="text-xs font-bold uppercase tracking-widest">Syncing Roster...</p>
          </div>
        ) : (
          filteredStudents.map((s, idx) => (
            <StudentCard 
              key={s.regNum}
              s={s}
              idx={idx}
              status={attendance[s.regNum] || 'present'}
              onSwipe={handleSwipe}
              onClick={toggleStatus}
            />
          ))
        )}
      </section>

      {/* Floating Action Bar */}
      <div className="fixed bottom-28 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-50">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || isLoading}
          className="w-full bg-gradient-to-r from-accent-blue to-accent-purple text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-accent-blue/40 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50 text-base"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : <Check size={24} />}
          {isSubmitting ? 'Syncing...' : 'Submit Attendance'}
        </button>
      </div>
    </div>
  );
};

export default MarkAttendance;
