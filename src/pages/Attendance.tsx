import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Briefcase, 
  AlertTriangle, 
  ChevronDown,
  Filter,
  ShieldCheck,
  TrendingUp,
  Database,
  ArrowLeft
} from 'lucide-react';
import { students } from '../data/students';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';

const Attendance: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reg, setReg] = useState(user?.reg || '');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState('');

  const fetchAttendance = React.useCallback(async (targetReg: string) => {
    if (!targetReg) return;

    setIsLoading(true);
    setError('');
    // We don't necessarily want to clear results every time if we want a smooth transition, 
    // but for now it's fine.

    try {
      const student = students.find(s => s.reg === targetReg);
      if (!student) {
        throw new Error('Student not found.');
      }

      const snap = await getDocs(collection(db, 'semester_4'));
      const docs = snap.docs;

      const filtered = docs.filter(d => {
        if (!fromDate && !toDate) return true;
        const date = new Date(d.id);
        if (fromDate && toDate) return date >= new Date(fromDate) && date <= new Date(toDate);
        if (fromDate) return date >= new Date(fromDate);
        if (toDate) return date <= new Date(toDate);
        return true;
      });

      const total = filtered.length;
      let absentCount = 0, intODCount = 0, extODCount = 0;
      const records: any[] = [];

      filtered.forEach(d => {
        const data = d.data();
        const dateStr = d.id;
        
        if (data.absents?.includes(targetReg)) {
          absentCount++;
          records.push({ date: dateStr, type: 'Absent', color: 'text-red-400', bg: 'bg-red-400/10', icon: XCircle });
        }
        if (data.internal_od?.includes(targetReg)) {
          intODCount++;
          records.push({ date: dateStr, type: 'Internal OD', color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: Briefcase });
        }
        if (data.external_od?.includes(targetReg)) {
          extODCount++;
          records.push({ date: dateStr, type: 'External OD', color: 'text-blue-400', bg: 'bg-blue-400/10', icon: ShieldCheck });
        }
      });

      const present = total - absentCount;
      const percentage = total > 0 ? (present / total) * 100 : 0;
      const safeLeaves = Math.max(0, Math.floor((present - 0.75 * total) / 0.75));

      setResults({
        name: student.name,
        reg: student.reg,
        total,
        present,
        absent: absentCount,
        od: intODCount + extODCount,
        percentage: percentage.toFixed(1),
        records: records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        safeLeaves,
        status: percentage >= 75 ? (percentage >= 85 ? 'Excellent' : 'Good') : (percentage >= 65 ? 'Warning' : 'Critical')
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data.');
    } finally {
      setIsLoading(false);
    }
  }, [fromDate, toDate]);

  // Load on mount if user is present
  React.useEffect(() => {
    if (user?.reg) {
      fetchAttendance(user.reg);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    fetchAttendance(reg);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Excellent': return 'text-emerald-400 bg-emerald-400/10';
      case 'Good': return 'text-blue-400 bg-blue-400/10';
      case 'Warning': return 'text-yellow-400 bg-yellow-400/10';
      case 'Critical': return 'text-red-400 bg-red-400/10';
      default: return 'text-text-secondary bg-bg-secondary';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short'
    });
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* Search Section */}
      <section className="bg-bg-card border border-border-color rounded-3xl p-6 shadow-xl">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={reg}
                onChange={(e) => setReg(e.target.value)}
                placeholder="Registration Number"
                className="w-full bg-bg-secondary border border-border-color rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-accent-blue text-sm"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-widest text-text-secondary px-2"
          >
            <div className="flex items-center gap-2">
              <Filter size={14} /> Filters
            </div>
            <ChevronDown size={14} className={clsx("transition-transform", showFilters && "rotate-180")} />
          </button>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-4 pt-2"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-text-secondary ml-2">From</label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-full bg-bg-secondary border border-border-color rounded-xl py-3 px-3 text-sm color-scheme-dark focus:border-accent-blue outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-text-secondary ml-2">To</label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-full bg-bg-secondary border border-border-color rounded-xl py-3 px-3 text-sm color-scheme-dark focus:border-accent-blue outline-none transition-colors"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-accent-blue to-accent-purple text-white font-bold py-3.5 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-sm"
          >
            {isLoading ? <Database className="animate-spin" size={18} /> : <Search size={18} />}
            {isLoading ? 'Fetching...' : 'Check Attendance'}
          </button>
        </form>
      </section>

      {/* Results */}
      <AnimatePresence mode="wait">
        {results ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Circular Progress & Major Stats */}
            <div className="bg-bg-card border border-border-color rounded-3xl p-6 flex flex-col items-center">
              <div className="relative w-40 h-40 mb-6">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    className="stroke-bg-secondary"
                    strokeWidth="3"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="stroke-accent-blue transition-all duration-1000 ease-out"
                    strokeWidth="3"
                    strokeDasharray={`${results.percentage}, 100`}
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black">{results.percentage}%</span>
                  <span className={clsx("text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mt-1", getStatusColor(results.status))}>
                    {results.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 w-full">
                <div className="text-center">
                  <p className="text-xl font-bold">{results.total}</p>
                  <p className="text-[10px] text-text-secondary uppercase font-bold">Days</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-emerald-400">{results.present}</p>
                  <p className="text-[10px] text-text-secondary uppercase font-bold">Pres</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-red-400">{results.absent}</p>
                  <p className="text-[10px] text-text-secondary uppercase font-bold">Abs</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-accent-purple">{results.od}</p>
                  <p className="text-[10px] text-text-secondary uppercase font-bold">OD</p>
                </div>
              </div>
            </div>

            {/* Safe Leaves Banner */}
            <div className={clsx(
              "p-5 rounded-3xl border flex items-center gap-4",
              results.safeLeaves > 0 ? "bg-emerald-400/10 border-emerald-400/20" : "bg-red-400/10 border-red-400/20"
            )}>
              <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", results.safeLeaves > 0 ? "bg-emerald-400/20 text-emerald-400" : "bg-red-400/20 text-red-400")}>
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-sm font-bold">
                  {results.safeLeaves > 0 
                    ? `You can take ${results.safeLeaves} more leave(s).` 
                    : "No more leaves allowed."}
                </p>
                <p className="text-[10px] text-text-secondary opacity-80 uppercase tracking-widest font-bold">Safe Leave Balance</p>
              </div>
            </div>

            {/* History List */}
            <div className="space-y-3 flex flex-col h-[400px]">
              <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary px-2 flex-shrink-0">History</h3>
              {results.records.length > 0 ? (
                <div className="space-y-2 overflow-y-auto pr-1 custom-scrollbar flex-grow pb-4 mask-gradient-bottom">
                  {results.records.map((record: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-bg-card border border-border-color rounded-2xl shrink-0">
                      <div className="flex items-center gap-3">
                        <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center", record.bg)}>
                          <record.icon size={18} className={record.color} />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{formatDate(record.date)}</p>
                          <p className={clsx("text-[10px] font-bold uppercase tracking-tight", record.color)}>{record.type}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-bg-secondary/20 rounded-3xl border border-dashed border-border-color">
                  <CheckCircle2 className="mx-auto text-text-secondary opacity-20 mb-2" size={32} />
                  <p className="text-xs text-text-secondary">No leave records found.</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : error ? (
          <div className="p-8 text-center bg-red-400/5 border border-red-400/20 rounded-3xl">
            <AlertTriangle className="mx-auto text-red-400 mb-2" size={32} />
            <p className="text-sm font-bold text-red-400">{error}</p>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-bg-card border border-border-color rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="text-text-secondary opacity-20" size={32} />
            </div>
            <p className="text-xs text-text-secondary uppercase tracking-widest font-bold">Search to view results</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Attendance;
