import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Search,
  ChevronRight,
  Share2,
  Check,
  ChevronLeft
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import { students } from '../data/students';
import { clsx } from 'clsx';
import { Link, useNavigate } from 'react-router-dom';

type Tab = 'absent' | 'od' | 'summary';

interface AttendanceRecord {
  id: string;
  absents?: string[];
  internal_od?: string[];
  external_od?: string[];
  [key: string]: any;
}

const ViewAttendance: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('summary');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchInitialDates = useCallback(async () => {
    try {
      const q = query(collection(db, 'attendance'));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        const sortedIds = snap.docs.map(d => d.id).sort();
        setFromDate(sortedIds[0]);
        
        const data = snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord))
          .sort((a, b) => b.id.localeCompare(a.id));
        
        setRecords(data);
      } else {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        setFromDate(d.toISOString().split('T')[0]);
      }
    } catch (e) {
      console.error("Initial fetch failed", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialDates();
  }, [fetchInitialDates]);

  const filteredRecords = React.useMemo(() => {
    return records.filter(doc => doc.id >= fromDate && doc.id <= toDate);
  }, [records, fromDate, toDate]);

  const getSummary = () => {
    return students.map(s => {
      let absentCount = 0;
      let iodCount = 0;
      let eodCount = 0;
      
      filteredRecords.forEach(r => {
        if (r.absents?.includes(s.regNum)) absentCount++;
        if (r.internal_od?.includes(s.regNum)) iodCount++;
        if (r.external_od?.includes(s.regNum)) eodCount++;
      });

      const totalDays = filteredRecords.length;
      const presentCount = totalDays - absentCount;
      const percentage = totalDays > 0 ? (presentCount / totalDays) * 100 : 100;

      return {
        ...s,
        absentCount,
        iodCount,
        eodCount,
        presentCount,
        totalDays,
        percentage
      };
    }).filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.regNum.includes(searchQuery)
    );
  };

  const exportCSV = async () => {
    const summary = getSummary();
    const headers = ["Reg Number", "Name", "Total Days", "Present", "Absent", "I-OD", "E-OD", "Percentage"];
    const rows = summary.map(s => [
      s.regNum,
      s.name,
      s.totalDays,
      s.presentCount,
      s.absentCount,
      s.iodCount,
      s.eodCount,
      s.percentage.toFixed(2) + '%'
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const fileName = `attendance_summary_${fromDate}_to_${toDate}.csv`;
    const file = new File([blob], fileName, { type: 'text/csv' });

    const downloadFallback = () => {
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert("Native file sharing is not supported on this browser. The CSV file has been downloaded instead.");
    };

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file]
        });
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Share failed', err);
        if (err instanceof Error && err.name !== 'AbortError') {
          downloadFallback();
        }
      }
    } else {
      downloadFallback();
    }
  };

  const summaryData = getSummary();

  return (
    <div className="space-y-6 max-w-lg md:max-w-5xl mx-auto pb-8">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column */}
        <div className="md:col-span-4 space-y-6">
          {/* Top Header Navigation */}
          <div className="flex items-center justify-between px-2 pt-2">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(-1)} 
                className="p-2.5 neu-btn rounded-xl flex items-center justify-center text-text-secondary hover:text-text-primary"
              >
                <ChevronLeft size={18} />
              </button>
              <h1 className="text-xl font-bold text-text-primary">Analytics</h1>
            </div>
            <button 
              onClick={exportCSV}
              className="p-2.5 neu-btn rounded-xl flex items-center justify-center shrink-0 text-accent-blue"
              title="Share CSV"
            >
              {copied ? <Check size={18} className="text-emerald-500" /> : <Share2 size={18} />}
            </button>
          </div>

          {/* Filters */}
          <section className="neu-flat rounded-3xl p-6 border border-border-color/10 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-text-secondary ml-1 tracking-wider">From</label>
                <input 
                  type="date" 
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full neu-input rounded-xl p-3 text-xs font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-text-secondary ml-1 tracking-wider">To</label>
                <input 
                  type="date" 
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full neu-input rounded-xl p-3 text-xs font-bold"
                />
              </div>
            </div>
          </section>

          {/* Search */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
              <Search size={18} />
            </div>
            <input 
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full neu-input rounded-2xl py-4.5 pl-12 pr-4 text-sm"
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="md:col-span-8 space-y-6">
          {/* Tabs */}
          <div className="flex p-1.5 neu-inset rounded-2xl">
            {(['summary', 'absent', 'od'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  "flex-grow py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer",
                  activeTab === tab 
                    ? "neu-flat text-accent-blue font-black" 
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                {tab === 'summary' ? 'Summary' : tab === 'absent' ? 'Absents' : 'ODs'}
              </button>
            ))}
          </div>

          {/* Content */}
          <section className="space-y-3">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-text-secondary neu-flat rounded-3xl border border-border-color/10">
                <div className="w-8 h-8 border-4 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin"></div>
                <p className="text-[10px] font-bold uppercase tracking-widest">Analyzing Records...</p>
              </div>
            ) : activeTab === 'summary' ? (
              summaryData.map((s, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.01 }}
                  key={s.regNum}
                >
                  <Link
                    to={`/student/${s.regNum}`}
                    className="flex items-center gap-4 p-4 neu-flat rounded-2xl group active:scale-[0.98] border border-border-color/10"
                  >
                    <div className={clsx(
                      "w-12 h-12 rounded-xl flex flex-col items-center justify-center font-black neu-inset shrink-0",
                      s.percentage < 75 ? "text-red-500 dark:text-red-400" : "text-emerald-500 dark:text-emerald-400"
                    )}>
                      <p className="text-xs leading-none">{s.percentage.toFixed(1)}</p>
                      <p className="text-[8px] mt-0.5">%</p>
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="font-bold text-sm truncate text-text-primary">{s.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-[10px] text-text-secondary font-mono">Roll: {s.regNum.slice(-3)}</p>
                        <span className="w-1 h-1 rounded-full bg-text-secondary/30"></span>
                        <p className="text-[10px] text-text-secondary">{s.presentCount}/{s.totalDays} Days</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-text-secondary group-hover:text-accent-blue transition-colors" />
                  </Link>
                </motion.div>
              ))
            ) : activeTab === 'absent' ? (
              <div className="neu-flat rounded-3xl overflow-hidden border border-border-color/10">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-bg-primary/55 border-b border-border-color/20">
                        <th className="p-4 text-[9px] font-black uppercase tracking-widest text-text-secondary whitespace-nowrap">Student</th>
                        {filteredRecords.map(r => (
                          <th key={r.id} className="p-4 text-[9px] font-black uppercase tracking-widest text-text-secondary whitespace-nowrap text-center">
                            {r.id.split('-').slice(1).join('/')}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map(s => (
                        <tr key={s.regNum} className="border-b border-border-color/10 last:border-0 hover:bg-bg-primary/20 transition-colors">
                          <td className="p-4 min-w-[140px]">
                            <p className="text-xs font-bold truncate text-text-primary">{s.name}</p>
                            <p className="text-[8px] text-text-secondary font-mono mt-0.5">{s.regNum}</p>
                          </td>
                          {filteredRecords.map(r => {
                            const isAbsent = r.absents?.includes(s.regNum);
                            return (
                              <td key={r.id} className="p-4 text-center">
                                <span className={clsx(
                                  "text-xs font-black",
                                  isAbsent ? "text-red-500 dark:text-red-400" : "text-emerald-500 dark:text-emerald-400"
                                )}>
                                  {isAbsent ? 'A' : 'P'}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="neu-flat rounded-3xl overflow-hidden border border-border-color/10">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-bg-primary/55 border-b border-border-color/20">
                        <th className="p-4 text-[9px] font-black uppercase tracking-widest text-text-secondary whitespace-nowrap">Student</th>
                        {filteredRecords.map(r => (
                          <th key={r.id} className="p-4 text-[9px] font-black uppercase tracking-widest text-text-secondary whitespace-nowrap text-center">
                            {r.id.split('-').slice(1).join('/')}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map(s => (
                        <tr key={s.regNum} className="border-b border-border-color/10 last:border-0 hover:bg-bg-primary/20 transition-colors">
                          <td className="p-4 min-w-[140px]">
                            <p className="text-xs font-bold truncate text-text-primary">{s.name}</p>
                            <p className="text-[8px] text-text-secondary font-mono mt-0.5">{s.regNum}</p>
                          </td>
                          {filteredRecords.map(r => {
                            const isIOD = r.internal_od?.includes(s.regNum);
                            const isEOD = r.external_od?.includes(s.regNum);
                            return (
                              <td key={r.id} className="p-4 text-center">
                                <span className={clsx(
                                  "text-[10px] font-black",
                                  isIOD ? "text-blue-500 dark:text-blue-400" : isEOD ? "text-purple-500 dark:text-purple-400" : "text-text-secondary/20"
                                )}>
                                  {isIOD ? 'IOD' : isEOD ? 'EOD' : '—'}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </div>

      </div>
    </div>
  );
};

export default ViewAttendance;
