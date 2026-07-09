import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, type PanInfo, useMotionValue, useTransform } from 'framer-motion';
import {
  Check,
  Loader2,
  Search,
  ShieldCheck,
  Briefcase,
  Calendar as CalendarIcon,
  Copy,
  ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
    <div className="relative overflow-hidden rounded-2xl">
      <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
        <motion.div
          style={{ opacity: opacityLeft, scale: scaleLeft }}
          className="flex items-center gap-2 text-purple-500"
        >
          <ShieldCheck size={20} />
          <span className="text-[10px] font-black uppercase whitespace-nowrap">External OD</span>
        </motion.div>

        <motion.div
          style={{ opacity: opacityRight, scale: scaleRight }}
          className="flex items-center gap-2 text-blue-500"
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
          "relative z-10 flex items-center gap-4 p-4 rounded-2xl transition-all select-none touch-pan-y border cursor-pointer",
          status === 'present' ? "neu-flat border-border-color/10" :
            status === 'absent' ? "neu-inset border-red-500/20 text-red-500" :
              status === 'internal_od' ? "neu-inset border-blue-500/20 text-blue-500" :
                "neu-inset border-purple-500/20 text-purple-500"
        )}
      >
        <div className={clsx(
          "w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 neu-inset transition-colors",
          status === 'present' ? "text-emerald-500 dark:text-emerald-400" :
            status === 'absent' ? "text-red-500 dark:text-red-400" :
              status === 'internal_od' ? "text-blue-500 dark:text-blue-400" :
                "text-purple-500 dark:text-purple-400"
        )}>
          {status === 'present' ? <Check size={16} /> : s.name.charAt(0)}
        </div>

        <div className="flex-grow min-w-0">
          <p className="font-bold text-sm truncate text-text-primary">{s.name}</p>
          <p className="text-[10px] text-text-secondary font-mono tracking-tighter opacity-60 mt-0.5">{s.regNum}</p>
        </div>

        <div className={clsx(
          "px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all",
          status === 'present' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 dark:text-emerald-400" :
            status === 'absent' ? "bg-red-500/10 border-red-500/20 text-red-500 dark:text-red-400" :
              status === 'internal_od' ? "bg-blue-500/10 border-blue-500/20 text-blue-500 dark:text-blue-400" :
                "bg-purple-500/10 border-purple-500/20 text-purple-500 dark:text-purple-400"
        )}>
          {status.replace('_', ' ')}
        </div>
      </motion.div>
    </div>
  );
};

const MarkAttendance: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const fallbackCopy = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Fallback copy failed', err);
    }
    document.body.removeChild(textArea);
  };

  const handleCopyReport = () => {
    const [year, month, dayStr] = selectedDate.split('-');
    const dateObj = new Date(Number(year), Number(month) - 1, Number(dayStr));
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    const formattedDate = `${dayStr.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;

    const absentList = students.filter(s => attendance[s.regNum] === 'absent');
    const absentText = absentList.length > 0
      ? absentList.map(s => s.regNum.slice(-3)).join(', ')
      : 'Nil';

    const totalStrength = students.length;
    const absentCount = absentList.length;
    const presentCount = totalStrength - absentCount;

    const report = `AIDS E III year\nDate: ${formattedDate}\nDay: ${dayName}\nPresent count : ${presentCount}\nAbsent count: ${absentCount}\nTotal strength : ${totalStrength}\nAbsentees:\n${absentText}`;

    const openWhatsApp = () => {
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(report)}`;
      const newWindow = window.open(whatsappUrl, '_blank');
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        window.location.href = whatsappUrl;
      }
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(report).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        openWhatsApp();
      }).catch(() => {
        fallbackCopy(report);
        openWhatsApp();
      });
    } else {
      fallbackCopy(report);
      openWhatsApp();
    }
  };

  const fetchAttendance = useCallback(async () => {
    setIsLoading(true);
    try {
      const docRef = doc(db, 'attendance', selectedDate);
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
      const current = prev[regNum] || 'present';
      const next = current === 'present' ? 'absent' : 'present';
      return { ...prev, [regNum]: next };
    });
  };

  const handleSwipe = (regNum: string, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x > threshold) {
      setAttendance(prev => ({ ...prev, [regNum]: 'external_od' }));
    } else if (info.offset.x < -threshold) {
      setAttendance(prev => ({ ...prev, [regNum]: 'internal_od' }));
    }
  };

  const saveAttendance = async () => {
    setIsSaving(true);
    try {
      const absents: string[] = [];
      const internal_od: string[] = [];
      const external_od: string[] = [];

      Object.entries(attendance).forEach(([regNum, status]) => {
        if (status === 'absent') absents.push(regNum);
        else if (status === 'internal_od') internal_od.push(regNum);
        else if (status === 'external_od') external_od.push(regNum);
      });

      const docRef = doc(db, 'attendance', selectedDate);
      await setDoc(docRef, {
        absents,
        internal_od,
        external_od
      });

      const [year, month, dayStr] = selectedDate.split('-');
      const dateObj = new Date(Number(year), Number(month) - 1, Number(dayStr));
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
      const formattedDate = `${dayStr.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;

      const absentList = students.filter(s => attendance[s.regNum] === 'absent');
      const absentText = absentList.length > 0
        ? absentList.map(s => s.regNum.slice(-3)).join(', ')
        : 'Nil';

      const totalStrength = students.length;
      const absentCount = absentList.length;
      const presentCount = totalStrength - absentCount;

      const report = `AIDS E III year\nDate: ${formattedDate}\nDay: ${dayName}\nPresent count : ${presentCount}\nAbsent count: ${absentCount}\nTotal strength : ${totalStrength}\nAbsentees:\n${absentText}\n _Check your attendance percentage from https://bit.ly/3Tb4ZSJ_`;

      const openWhatsApp = () => {
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(report)}`;
        const newWindow = window.open(whatsappUrl, '_blank');
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          window.location.href = whatsappUrl;
        }
      };

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(report).then(() => {
          openWhatsApp();
          alert("Attendance saved and copied to clipboard successfully!");
        }).catch(() => {
          fallbackCopy(report);
          openWhatsApp();
          alert("Attendance saved and copied to clipboard successfully!");
        });
      } else {
        fallbackCopy(report);
        openWhatsApp();
        alert("Attendance saved and copied to clipboard successfully!");
      }
    } catch (e) {
      console.error("Save failed", e);
      alert("Failed to save attendance.");
    } finally {
      setIsSaving(false);
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
      {/* Top Header Navigation */}
      <div className="flex items-center gap-4 px-2 pt-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 neu-btn rounded-xl flex items-center justify-center text-text-secondary hover:text-text-primary"
        >
          <ChevronLeft size={18} />
        </button>
        <h1 className="text-xl font-bold text-text-primary">Mark Attendance</h1>
      </div>

      {/* Header Info Panel */}
      <section className="neu-flat rounded-3xl p-6 relative overflow-hidden border border-border-color/10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-black uppercase text-text-secondary tracking-wider">Configure Session</span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest border border-emerald-500/20 shadow-inner animate-pulse">Active</span>
            </div>
            <div className="flex gap-2">
              <div
                className="flex items-center gap-3 neu-inset p-3 rounded-2xl cursor-pointer grow"
                onClick={(e) => {
                  const input = e.currentTarget.querySelector('input');
                  if (input instanceof HTMLInputElement) {
                    const target = input as any;
                    try {
                      if (target.showPicker) {
                        target.showPicker();
                      } else {
                        target.focus();
                      }
                    } catch (err) {
                      target.focus();
                    }
                  }
                }}
              >
                <CalendarIcon size={18} className="text-accent-blue" />
                <input
                  type="date"
                  value={selectedDate}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-sm font-bold focus:outline-none grow color-scheme-dark cursor-pointer text-text-primary"
                />
              </div>
              <button
                onClick={handleCopyReport}
                className="p-3.5 neu-btn text-accent-blue rounded-2xl active:scale-95 transition-all flex items-center justify-center shrink-0"
                title="Copy WhatsApp Report"
              >
                {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div className="neu-inset p-3 rounded-2xl text-center">
              <p className="text-[8px] uppercase font-black text-text-secondary tracking-widest">Present</p>
              <p className="text-lg font-black text-emerald-500 dark:text-emerald-400 mt-1">{stats.present}</p>
            </div>
            <div className="neu-inset p-3 rounded-2xl text-center">
              <p className="text-[8px] uppercase font-black text-text-secondary tracking-widest">Absent</p>
              <p className="text-lg font-black text-red-500 dark:text-red-400 mt-1">{stats.absent}</p>
            </div>
            <div className="neu-inset p-3 rounded-2xl text-center">
              <p className="text-[8px] uppercase font-black text-text-secondary tracking-widest">I-OD</p>
              <p className="text-lg font-black text-blue-500 dark:text-blue-400 mt-1">{stats.iod}</p>
            </div>
            <div className="neu-inset p-3 rounded-2xl text-center">
              <p className="text-[8px] uppercase font-black text-text-secondary tracking-widest">E-OD</p>
              <p className="text-lg font-black text-purple-500 dark:text-purple-400 mt-1">{stats.eod}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Search */}
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary transition-colors">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Search name or roll number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full neu-input rounded-2xl py-4.5 pl-12 pr-4 text-sm"
        />
      </div>

      {/* Student List */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-2 mb-1">
          <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest">
            Viewing records for {selectedDate}
          </p>
          <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest">
            {filteredStudents.length} Students
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-text-secondary neu-flat rounded-3xl border border-border-color/10">
            <Loader2 className="animate-spin text-accent-blue" size={28} />
            <p className="text-[10px] font-bold uppercase tracking-widest">Syncing Roster...</p>
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
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-50">
        <button
          onClick={saveAttendance}
          disabled={isSaving}
          className="w-full neu-btn text-accent-blue font-black py-4.5 rounded-2xl shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50 text-base border border-border-color/10"
        >
          {isSaving ? (
            <>
              <Loader2 className="animate-spin text-accent-blue shrink-0" size={20} />
              Saving Attendance...
            </>
          ) : (
            <>
              <Check size={20} className="text-accent-blue shrink-0" />
              Save Attendance
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default MarkAttendance;
