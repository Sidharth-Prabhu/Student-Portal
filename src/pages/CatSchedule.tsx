import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  ChevronLeft,
  Info,
  BookOpen,
  MapPin,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { catSchedule } from '../data/catSchedule';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const CatSchedule: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  interface SeatingAllocation {
    courseCode: string;
    date: string;
    hallNo: string;
    name: string;
    seatNo: string;
  }
  
  const [seating, setSeating] = useState<SeatingAllocation | null>(null);
  const [loadingSeating, setLoadingSeating] = useState(true);

  useEffect(() => {
    const fetchSeating = async () => {
      if (!user?.regNum) return;
      try {
        const docRef = doc(db, 'seating_allocations', user.regNum);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSeating(docSnap.data() as SeatingAllocation);
        }
      } catch (e) {
        console.error("Error fetching seating allocations", e);
      } finally {
        setLoadingSeating(false);
      }
    };
    fetchSeating();
  }, [user]);

  const [searchRegNum, setSearchRegNum] = useState('');
  const [searchedSeating, setSearchedSeating] = useState<SeatingAllocation | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchRegNum.trim()) return;

    setSearchLoading(true);
    setSearchError('');
    setSearchedSeating(null);

    try {
      const docRef = doc(db, 'seating_allocations', searchRegNum.trim());
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSearchedSeating(docSnap.data() as SeatingAllocation);
      } else {
        setSearchError('No seating allocation found for this registration number.');
      }
    } catch (err) {
      console.error("Search error", err);
      setSearchError('Failed to fetch seating allocation. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  // Parse date helper (format: DD-MMM-YY, e.g., "15-Jul-26")
  const parseDateStr = (dateStr: string) => {
    const parts = dateStr.split('-');
    const months: Record<string, string> = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
      'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };
    return new Date(`20${parts[2]}-${months[parts[1]]}-${parts[0]}T00:00:00`);
  };

  const getDaysRemaining = (examDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const examDate = parseDateStr(examDateStr);
    const diffTime = examDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getTodaySeatingStr = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = String(today.getFullYear()).slice(-2);
    return `${day}.${month}.${year}`;
  };
  const formattedToday = getTodaySeatingStr();

  // Find next exam relative to current time
  const upcomingExams = catSchedule
    .map(exam => ({ ...exam, daysLeft: getDaysRemaining(exam.date) }))
    .filter(exam => exam.daysLeft >= 0)
    .sort((a, b) => parseDateStr(a.date).getTime() - parseDateStr(b.date).getTime());

  const nextExam = upcomingExams[0];
  const completedCount = catSchedule.filter(exam => getDaysRemaining(exam.date) < 0).length;

  const hasExamToday = catSchedule.some(exam => getDaysRemaining(exam.date) === 0);

  return (
    <div className="space-y-6 max-w-lg md:max-w-5xl mx-auto pb-8">
      {/* Header */}
      <div className="flex items-center gap-4 px-2 pt-2">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2.5 neu-btn rounded-xl flex items-center justify-center text-text-secondary hover:text-text-primary"
        >
          <ChevronLeft size={18} />
        </button>
        <h1 className="text-2xl font-black text-text-primary flex items-center gap-2">
          <CalendarIcon className="text-accent-blue" size={24} />
          CAT Schedule
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column */}
        <div className="md:col-span-5 space-y-6">
          {/* Live Status Cards */}
          <section className="grid grid-cols-2 gap-4">
            <div className="neu-flat rounded-3xl p-5 relative overflow-hidden border border-border-color/10">
              <div className="absolute top-0 right-0 w-12 h-12 bg-accent-blue/5 blur-xl rounded-full"></div>
              <div className="relative z-10 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl neu-inset flex items-center justify-center text-accent-blue">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold text-text-secondary tracking-wider">Completed</p>
                  <p className="text-base font-black leading-tight mt-1 text-text-primary">
                    {completedCount} / {catSchedule.length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="neu-flat rounded-3xl p-5 relative overflow-hidden border border-border-color/10">
              <div className="absolute top-0 right-0 w-12 h-12 bg-accent-purple/5 blur-xl rounded-full"></div>
              <div className="relative z-10 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl neu-inset flex items-center justify-center text-accent-purple">
                  <BookOpen size={18} />
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold text-text-secondary tracking-wider">Next Up</p>
                  <p className="text-xs font-bold truncate leading-tight mt-1.5 text-text-primary" title={nextExam ? nextExam.courseTitle : 'None'}>
                    {nextExam ? nextExam.courseTitle : 'Completed! 🎉'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Banner Details */}
          <div className="neu-flat rounded-3xl p-5 border border-border-color/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-blue/5 blur-2xl rounded-full"></div>
            <p className="text-[9px] uppercase font-bold text-text-secondary tracking-widest font-mono">Exam Period Details</p>
            <h2 className="text-lg font-black text-text-primary mt-2">Continuous Assessment Test</h2>
            <p className="text-[10px] text-text-secondary mt-1.5 leading-relaxed font-medium">
              Forenoon Session (F.N.): <strong>09:30 AM – 11:00 AM</strong><br />
              Afternoon Session (A.N.): <strong>01:30 PM – 03:00 PM</strong>
            </p>
          </div>

          {/* Seating Allocation Card */}
          <div className="neu-flat rounded-3xl p-5 border border-border-color/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl rounded-full"></div>
            <p className="text-[9px] uppercase font-bold text-text-secondary tracking-widest font-mono flex items-center gap-1.5">
              <MapPin size={10} className="text-emerald-500" />
              Live Seating Allocation
            </p>
            {loadingSeating ? (
              <div className="mt-3 space-y-2 animate-pulse">
                <div className="h-4 w-3/4 bg-bg-secondary rounded"></div>
                <div className="h-3 w-1/2 bg-bg-secondary rounded"></div>
              </div>
            ) : (seating && seating.date === formattedToday) ? (
              <div className="mt-3 space-y-3">
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="neu-inset p-3 rounded-2xl text-center">
                    <p className="text-[8px] uppercase font-bold text-text-secondary tracking-wider">Hall Number</p>
                    <p className="text-base font-black text-emerald-500 mt-1">{seating.hallNo}</p>
                  </div>
                  <div className="neu-inset p-3 rounded-2xl text-center">
                    <p className="text-[8px] uppercase font-bold text-text-secondary tracking-wider">Seat Number</p>
                    <p className="text-base font-black text-accent-purple mt-1">{seating.seatNo}</p>
                  </div>
                </div>
                <div className="text-[10px] text-text-secondary/90 space-y-1 font-medium bg-bg-secondary/40 p-2.5 rounded-xl border border-border-color/5">
                  <p><strong>Course:</strong> {seating.courseCode}</p>
                  <p><strong>Exam Date:</strong> {seating.date}</p>
                  <p><strong>Student:</strong> {seating.name}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs font-bold text-text-secondary mt-3 italic">
                No seating allocation for today.
              </p>
            )}
          </div>

          {/* Seating Search Card */}
          <div className="neu-flat rounded-3xl p-5 border border-border-color/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-blue/5 blur-2xl rounded-full"></div>
            <p className="text-[9px] uppercase font-bold text-text-secondary tracking-widest font-mono flex items-center gap-1.5 mb-3.5">
              <Search size={10} className="text-accent-blue" />
              Search Seating Allocation
            </p>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchRegNum}
                onChange={(e) => setSearchRegNum(e.target.value)}
                placeholder="Enter Registration No."
                className="flex-grow px-4 py-2.5 rounded-xl bg-bg-secondary border border-border-color/10 text-xs font-medium focus:outline-none focus:border-accent-blue/50 text-text-primary placeholder:text-text-secondary/50 font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-accent-blue text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                disabled={searchLoading}
              >
                {searchLoading ? '...' : <Search size={13} />}
              </button>
            </form>

            {searchError && (
              <p className="text-[10px] text-red-500 font-bold mt-2.5 px-1">{searchError}</p>
            )}

            {searchedSeating && (
              <div className="mt-3.5 space-y-3.5 border-t border-border-color/5 pt-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="neu-inset p-3 rounded-2xl text-center">
                    <p className="text-[8px] uppercase font-bold text-text-secondary tracking-wider">Hall</p>
                    <p className="text-base font-black text-emerald-500 mt-1">{searchedSeating.hallNo}</p>
                  </div>
                  <div className="neu-inset p-3 rounded-2xl text-center">
                    <p className="text-[8px] uppercase font-bold text-text-secondary tracking-wider">Seat</p>
                    <p className="text-base font-black text-accent-purple mt-1">{searchedSeating.seatNo}</p>
                  </div>
                </div>
                <div className="text-[10px] text-text-secondary/90 space-y-1 font-medium bg-bg-secondary/40 p-2.5 rounded-xl border border-border-color/5">
                  <p><strong>Student:</strong> {searchedSeating.name}</p>
                  <p><strong>Course:</strong> {searchedSeating.courseCode}</p>
                  <p><strong>Exam Date:</strong> {searchedSeating.date}</p>
                </div>
              </div>
            )}
          </div>

          {/* Tip */}
          <div className="neu-inset rounded-2xl p-4 flex items-start gap-3 border border-border-color/5">
            <Info size={15} className="text-accent-blue shrink-0 mt-0.5" />
            <p className="text-[9px] text-text-secondary leading-normal font-medium italic">
              Upcoming exams are highlighted automatically. Forenoon (F.N.) exams take place from 09:30 AM to 11:00 AM.
            </p>
          </div>
        </div>

        {/* Right Column (Exams List) */}
        <div className="md:col-span-7 space-y-4">
          <div className="flex gap-4 items-stretch">
            {/* Left timeline line */}
            <div className="w-1.5 neu-inset rounded-full relative shrink-0 my-1 border-0">
              {hasExamToday && (
                <>
                  <div className="absolute top-0 left-0 w-full h-full bg-accent-blue/30 rounded-full z-10" />
                  <motion.div 
                    className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-accent-blue rounded-full z-20 shadow-[0_0_15px_rgba(59,130,246,0.8)] top-1/2"
                    animate={{ 
                      scale: [1, 1.4, 1],
                      opacity: [0.8, 1, 0.8]
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 2, 
                      ease: "easeInOut" 
                    }}
                  />
                </>
              )}
            </div>

            <section className="flex-grow space-y-3">
              {catSchedule.map((exam, idx) => {
                const daysRemaining = getDaysRemaining(exam.date);
                const isPast = daysRemaining < 0;
                const isToday = daysRemaining === 0;

                const dateParts = exam.date.split('-');
                const examDayNum = dateParts[0];
                const examMonth = dateParts[1];

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={`${exam.courseCode}-${exam.session}`}
                    className={clsx(
                      "flex items-center gap-4 p-5 rounded-2xl border transition-all relative overflow-hidden",
                      isPast 
                        ? "neu-flat opacity-60 border-border-color/10" 
                        : isToday
                          ? "neu-flat border-accent-blue/40 ring-1 ring-accent-blue/30 scale-[1.01]"
                          : "neu-flat border-border-color/10 hover:border-accent-blue/30"
                    )}
                  >
                    {isToday && (
                      <div className="absolute top-0 right-0 w-24 h-24 bg-accent-blue/5 blur-2xl rounded-full"></div>
                    )}

                    {/* Date/Session indicator */}
                    <div className="w-16 text-center shrink-0 flex flex-col items-center justify-center">
                      <span className="text-[9px] uppercase tracking-wider font-extrabold opacity-60 text-text-secondary leading-none">
                        {exam.day.slice(0, 3)}
                      </span>
                      <span className={clsx("text-sm font-black mt-1 leading-none", isToday ? "text-accent-blue" : "text-text-primary")}>
                        {examDayNum} {examMonth}
                      </span>
                      <span className="text-[8px] uppercase font-bold text-text-secondary tracking-tight mt-1.5 bg-bg-secondary px-1.5 py-0.5 rounded border border-border-color/10">
                        {exam.session}
                      </span>
                    </div>
                    
                    <div className={clsx("h-10 w-[1px]", isToday ? "bg-accent-blue/45" : "bg-text-secondary/20")}></div>
                    
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold leading-tight text-text-primary">{exam.courseTitle}</p>
                        {isToday && (
                          <span className="flex h-1.5 w-1.5 rounded-full bg-accent-blue animate-pulse"></span>
                        )}
                      </div>
                      <p className="text-[9px] text-text-secondary mt-1 font-mono">{exam.courseCode}</p>
                      {seating && seating.date === formattedToday && seating.courseCode === exam.courseCode && (
                        <div className="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-bold">
                           <MapPin size={8} />
                           <span>Hall: {seating.hallNo} • Seat: {seating.seatNo}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {isPast ? (
                        <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 size={10} /> DONE
                        </span>
                      ) : isToday ? (
                        <span className="text-[9px] text-accent-blue font-bold uppercase tracking-wider animate-pulse">
                          TODAY
                        </span>
                      ) : (
                        <span className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">
                          in {daysRemaining} days
                        </span>
                      )}
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

export default CatSchedule;
