import React, { useState, useEffect } from 'react';
import { 
  UserMinus, 
  Clock,
  PieChart as PieIcon,
  Copy,
  Check,
  ChevronLeft
} from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { students } from '../data/students';
import { useNavigate } from 'react-router-dom';

interface AttendanceDayData {
  absents?: string[];
  internal_od?: string[];
  external_od?: string[];
  [key: string]: unknown;
}

const Summary: React.FC = () => {
  const navigate = useNavigate();
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

    const report = `AIDS E III year\nDate: ${formattedDate}\nDay: ${dayName}\nPresent count : ${presentCount}\nAbsent count: ${absentCount}\nTotal strength : ${totalStrength}\nAbsentees:\n${absentText}\n _Check your attendance percentage from_ bit.ly/3Tb4ZSJ`;

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
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-text-secondary max-w-lg mx-auto neu-flat rounded-3xl border border-border-color/10">
        <div className="w-10 h-10 border-4 border-accent-purple/30 border-t-accent-purple rounded-full animate-spin"></div>
        <p className="text-[10px] font-bold uppercase tracking-widest">Generating Summary...</p>
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
      {/* Top Header Navigation */}
      <div className="flex items-center gap-4 px-2 pt-2">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2.5 neu-btn rounded-xl flex items-center justify-center text-text-secondary hover:text-text-primary"
        >
          <ChevronLeft size={18} />
        </button>
        <h1 className="text-xl font-bold text-text-primary">Today's Summary</h1>
      </div>

      {/* Header Card */}
      <section className="neu-flat rounded-3xl p-6 relative overflow-hidden text-center border border-border-color/10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/5 blur-3xl rounded-full"></div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl neu-inset flex items-center justify-center text-accent-purple">
            <PieIcon size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">Overview</h2>
            <p className="text-text-secondary text-[10px] font-bold uppercase tracking-wider mt-1">{new Date().toDateString()}</p>
          </div>
          {data && (
            <button
              onClick={handleCopyReport}
              className="mt-2.5 flex items-center gap-2 px-5 py-2.5 neu-btn text-accent-purple rounded-xl text-xs font-bold"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-500" />
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
        <div className="neu-inset p-5 rounded-2xl text-left">
          <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-1">Present</p>
          <div className="flex items-end gap-1.5 mt-1">
            <p className="text-3xl font-black text-emerald-500 dark:text-emerald-400">{presentCount}</p>
            <p className="text-xs text-text-secondary mb-1 font-bold">/ {students.length}</p>
          </div>
        </div>
        <div className="neu-inset p-5 rounded-2xl text-left">
          <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-1">Absentees</p>
          <p className="text-3xl font-black text-red-500 dark:text-red-400 mt-1">{absents.length}</p>
        </div>
      </section>

      {/* Breakdowns */}
      <div className="space-y-6">
        {/* Absentees List */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-2">
            <div className="w-1.5 h-4 bg-red-500 rounded-full"></div>
            <h2 className="text-xs font-black uppercase tracking-wider text-text-secondary">Absentees</h2>
          </div>
          <div className="neu-flat rounded-3xl overflow-hidden divide-y divide-border-color/10 border border-border-color/10">
            {absents.length === 0 ? (
              <div className="p-8 text-center text-text-secondary">
                <p className="text-xs font-bold text-text-secondary">All students present! 🎉</p>
              </div>
            ) : (
              absents.map((reg: string) => (
                <div key={reg} className="p-4 flex items-center justify-between group bg-transparent">
                  <div>
                    <p className="text-sm font-bold text-text-primary">{getStudentName(reg)}</p>
                    <p className="text-[10px] text-text-secondary font-mono mt-0.5">{reg}</p>
                  </div>
                  <div className="w-8 h-8 rounded-lg neu-inset flex items-center justify-center text-red-500 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <UserMinus size={15} />
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
            <h2 className="text-xs font-black uppercase tracking-wider text-text-secondary">On Duty (OD)</h2>
          </div>
          <div className="neu-flat rounded-3xl overflow-hidden divide-y divide-border-color/10 border border-border-color/10">
            {[...internalOD, ...externalOD].length === 0 ? (
              <div className="p-8 text-center text-text-secondary">
                <p className="text-xs text-text-secondary">No students on OD.</p>
              </div>
            ) : (
              <>
                {internalOD.map((reg: string) => (
                  <div key={reg} className="p-4 flex items-center justify-between group bg-transparent">
                    <div>
                      <p className="text-sm font-bold text-text-primary">{getStudentName(reg)}</p>
                      <p className="text-[9px] text-blue-500 dark:text-blue-400 font-bold uppercase mt-1 tracking-wider">INTERNAL OD</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg neu-inset flex items-center justify-center text-blue-500">
                      <Clock size={15} />
                    </div>
                  </div>
                ))}
                {externalOD.map((reg: string) => (
                  <div key={reg} className="p-4 flex items-center justify-between group bg-transparent">
                    <div>
                      <p className="text-sm font-bold text-text-primary">{getStudentName(reg)}</p>
                      <p className="text-[9px] text-purple-500 dark:text-purple-400 font-bold uppercase mt-1 tracking-wider">EXTERNAL OD</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg neu-inset flex items-center justify-center text-purple-500">
                      <Clock size={15} />
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
