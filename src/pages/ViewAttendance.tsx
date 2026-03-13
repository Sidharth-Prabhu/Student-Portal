import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Search,
  ChevronRight
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import { students } from '../data/students';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';

type Tab = 'absent' | 'od' | 'summary';

interface AttendanceRecord {
  id: string;
  absents?: string[];
  internal_od?: string[];
  external_od?: string[];
  [key: string]: any;
}

const ViewAttendance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('summary');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchInitialDates = useCallback(async () => {
    try {
      // Fetch all docs once to avoid complex orderBy/where indexing issues
      // Since it's a semester's data, the document count is manageable (~100-200 docs)
      const q = query(collection(db, 'semester_4'));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        const sortedIds = snap.docs.map(d => d.id).sort();
        setFromDate(sortedIds[0]); // Least date
        
        const data = snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord))
          .sort((a, b) => b.id.localeCompare(a.id)); // Default desc
        
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

  // Derived filtered records to avoid redundant Firestore calls
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
      // presentCount includes OD days
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

  const exportCSV = () => {
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
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `attendance_summary_${fromDate}_to_${toDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const summaryData = getSummary();

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-8">
      {/* Filters */}
      <section className="bg-bg-card border border-border-color rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Attendance Analytics</h1>
          <button 
            onClick={exportCSV}
            className="p-2 bg-accent-blue/10 text-accent-blue rounded-xl active:scale-95 transition-transform"
          >
            <Download size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-text-secondary ml-1">From</label>
            <input 
              type="date" 
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full bg-bg-secondary border border-border-color rounded-xl p-3 text-xs font-bold focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-text-secondary ml-1">To</label>
            <input 
              type="date" 
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full bg-bg-secondary border border-border-color rounded-xl p-3 text-xs font-bold focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex p-1 bg-bg-card border border-border-color rounded-2xl shadow-lg">
        {(['summary', 'absent', 'od'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              "flex-grow py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === tab ? "bg-accent-blue text-white shadow-lg shadow-accent-blue/20" : "text-text-secondary"
            )}
          >
            {tab === 'summary' ? 'Summary' : tab === 'absent' ? 'Absents' : 'ODs'}
          </button>
        ))}
      </div>

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
          className="w-full bg-bg-card border border-border-color rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-accent-blue transition-all shadow-lg"
        />
      </div>

      {/* Content */}
      <section className="space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-text-secondary">
            <div className="w-10 h-10 border-4 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin"></div>
            <p className="text-xs font-bold uppercase tracking-widest">Analyzing Records...</p>
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
                className="flex items-center gap-4 p-4 bg-bg-card border border-border-color rounded-2xl group active:scale-[0.98] transition-all shadow-sm"
              >
                <div className={clsx(
                  "w-12 h-12 rounded-xl flex flex-col items-center justify-center font-black shadow-inner border",
                  s.percentage < 75 ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                )}>
                  <p className="text-xs leading-none">{s.percentage.toFixed(2)}</p>
                  <p className="text-[8px]">%</p>
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="font-bold text-sm truncate">{s.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[10px] text-text-secondary font-mono">Roll: {s.regNum.slice(-3)}</p>
                    <span className="w-1 h-1 rounded-full bg-border-color"></span>
                    <p className="text-[10px] text-text-secondary">{s.presentCount}/{s.totalDays} Days</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-text-secondary group-hover:text-accent-blue transition-colors" />
              </Link>
            </motion.div>
          ))
        ) : activeTab === 'absent' ? (
          <div className="bg-bg-card border border-border-color rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-bg-secondary/50 border-b border-border-color">
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-text-secondary whitespace-nowrap">Student</th>
                    {filteredRecords.map(r => (
                      <th key={r.id} className="p-4 text-[10px] font-black uppercase tracking-widest text-text-secondary whitespace-nowrap text-center">
                        {r.id.split('-').slice(1).join('/')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map(s => (
                    <tr key={s.regNum} className="border-b border-border-color/50 last:border-0 hover:bg-bg-secondary/20 transition-colors">
                      <td className="p-4 min-w-[140px]">
                        <p className="text-xs font-bold truncate">{s.name}</p>
                        <p className="text-[8px] text-text-secondary font-mono">{s.regNum}</p>
                      </td>
                      {filteredRecords.map(r => {
                        const isAbsent = r.absents?.includes(s.regNum);
                        return (
                          <td key={r.id} className="p-4 text-center">
                            <span className={clsx(
                              "text-xs font-black",
                              isAbsent ? "text-red-400" : "text-emerald-400"
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
          <div className="bg-bg-card border border-border-color rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-bg-secondary/50 border-b border-border-color">
                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-text-secondary whitespace-nowrap">Student</th>
                    {filteredRecords.map(r => (
                      <th key={r.id} className="p-4 text-[10px] font-black uppercase tracking-widest text-text-secondary whitespace-nowrap text-center">
                        {r.id.split('-').slice(1).join('/')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map(s => (
                    <tr key={s.regNum} className="border-b border-border-color/50 last:border-0 hover:bg-bg-secondary/20 transition-colors">
                      <td className="p-4 min-w-[140px]">
                        <p className="text-xs font-bold truncate">{s.name}</p>
                        <p className="text-[8px] text-text-secondary font-mono">{s.regNum}</p>
                      </td>
                      {filteredRecords.map(r => {
                        const isIOD = r.internal_od?.includes(s.regNum);
                        const isEOD = r.external_od?.includes(s.regNum);
                        return (
                          <td key={r.id} className="p-4 text-center">
                            <span className={clsx(
                              "text-[10px] font-black",
                              isIOD ? "text-blue-400" : isEOD ? "text-purple-400" : "text-text-secondary/20"
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
  );
};

export default ViewAttendance;
