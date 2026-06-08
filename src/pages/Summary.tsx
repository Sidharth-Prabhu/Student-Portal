import React, { useState, useEffect } from 'react';
import { 
  UserMinus, 
  Clock,
  PieChart as PieIcon,
  Copy,
  Check
} from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { students } from '../data/students';

interface AttendanceDayData {
  absents?: string[];
  internal_od?: string[];
  external_od?: string[];
  [key: string]: unknown;
}

const Summary: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  const [data, setData] = useState<AttendanceDayData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
    if (!data) return;
    const dateObj = new Date(today);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    const [year, month, dayStr] = today.split('-');
    const formattedDate = `${dayStr.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;

    const absentsList = data.absents || [];
    const absentStudents = students.filter(s => absentsList.includes(s.regNum));
    const absentText = absentStudents.length > 0
      ? absentStudents.map(s => s.regNum.slice(-3)).join(', ')
      : 'Nil';

    const totalStrength = students.length;
    const absentCount = absentStudents.length;
    const presentCount = totalStrength - absentCount;

    const report = `AIDS E III year\nDate: ${formattedDate}\nDay: ${dayName}\nPresent count : ${presentCount}\nAbsent count: ${absentCount}\nTotal strength : ${totalStrength}\nAbsentees:\n${absentText}`;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(report).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        fallbackCopy(report);
      });
    } else {
      fallbackCopy(report);
    }
  };

  useEffect(() => {
    const fetchToday = async () => {
      try {
        const docRef = doc(db, 'attendance', today);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setData(docSnap.data());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchToday();
  }, [today]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-text-secondary">
        <div className="w-12 h-12 border-4 border-accent-purple/30 border-t-accent-purple rounded-full animate-spin"></div>
        <p className="text-xs font-black uppercase tracking-widest">Generating Summary...</p>
      </div>
    );
  }

  const absents = data?.absents || [];
  const internalOD = data?.internal_od || [];
  const externalOD = data?.external_od || [];
  const totalMarked = absents.length + internalOD.length + externalOD.length;
  const presentCount = students.length - totalMarked;

  const getStudentName = (reg: string) => students.find(s => s.regNum === reg)?.name || reg;

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-8">
      {/* Header Card */}
      <section className="bg-bg-card border border-border-color rounded-3xl p-8 shadow-xl relative overflow-hidden text-center">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-accent-purple/10 flex items-center justify-center text-accent-purple shadow-inner">
            <PieIcon size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black">Today's Overview</h1>
            <p className="text-text-secondary text-xs font-bold uppercase tracking-widest mt-1">{new Date().toDateString()}</p>
          </div>
          {data && (
            <button
              onClick={handleCopyReport}
              className="mt-2 flex items-center gap-2 px-4 py-2 bg-bg-secondary hover:bg-accent-purple/15 text-text-secondary hover:text-accent-purple rounded-xl border border-border-color text-xs font-bold transition-all active:scale-95"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-400" />
                  Copied Report!
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copy WhatsApp Report
                </>
              )}
            </button>
          )}
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 gap-4">
        <div className="bg-bg-card border border-border-color p-5 rounded-3xl shadow-lg">
          <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Present</p>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-black text-emerald-400">{presentCount}</p>
            <p className="text-xs text-text-secondary mb-1 font-bold">/ {students.length}</p>
          </div>
        </div>
        <div className="bg-bg-card border border-border-color p-5 rounded-3xl shadow-lg">
          <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Absentees</p>
          <p className="text-3xl font-black text-red-400">{absents.length}</p>
        </div>
      </section>

      {/* Breakdowns */}
      <div className="space-y-4">
        {/* Absentees List */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-2">
            <div className="w-1.5 h-4 bg-red-400 rounded-full"></div>
            <h2 className="text-xs font-black uppercase tracking-widest text-text-secondary">Absentees</h2>
          </div>
          <div className="bg-bg-card border border-border-color rounded-3xl overflow-hidden divide-y divide-border-color/50 shadow-lg">
            {absents.length === 0 ? (
              <div className="p-8 text-center text-text-secondary">
                <p className="text-sm font-bold">All students present! 🎉</p>
              </div>
            ) : (
              absents.map((reg: string) => (
                <div key={reg} className="p-4 flex items-center justify-between group">
                  <div>
                    <p className="text-sm font-bold">{getStudentName(reg)}</p>
                    <p className="text-[10px] text-text-secondary font-mono mt-0.5">{reg}</p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-red-400/10 flex items-center justify-center text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <UserMinus size={16} />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* OD List */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-2">
            <div className="w-1.5 h-4 bg-accent-blue rounded-full"></div>
            <h2 className="text-xs font-black uppercase tracking-widest text-text-secondary">On Duty (OD)</h2>
          </div>
          <div className="bg-bg-card border border-border-color rounded-3xl overflow-hidden divide-y divide-border-color/50 shadow-lg">
            {[...internalOD, ...externalOD].length === 0 ? (
              <div className="p-8 text-center text-text-secondary">
                <p className="text-sm font-bold">No students on OD.</p>
              </div>
            ) : (
              <>
                {internalOD.map((reg: string) => (
                  <div key={reg} className="p-4 flex items-center justify-between bg-blue-500/5 group">
                    <div>
                      <p className="text-sm font-bold">{getStudentName(reg)}</p>
                      <p className="text-[10px] text-blue-400 font-mono mt-0.5">INTERNAL OD</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-blue-400/10 flex items-center justify-center text-blue-400">
                      <Clock size={16} />
                    </div>
                  </div>
                ))}
                {externalOD.map((reg: string) => (
                  <div key={reg} className="p-4 flex items-center justify-between bg-purple-500/5 group">
                    <div>
                      <p className="text-sm font-bold">{getStudentName(reg)}</p>
                      <p className="text-[10px] text-purple-400 font-mono mt-0.5">EXTERNAL OD</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-purple-400/10 flex items-center justify-center text-purple-400">
                      <Clock size={16} />
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Summary;
