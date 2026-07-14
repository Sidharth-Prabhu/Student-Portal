import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  Briefcase, 
  AlertTriangle, 
  ChevronDown,
  Filter,
  ShieldCheck,
  TrendingUp,
  Database,
  Calendar,
  Calculator,
  type LucideIcon
} from 'lucide-react';
import { students } from '../data/students';
import { clsx } from 'clsx';

interface AttendanceRecord {
  date: string;
  type: string;
  color: string;
  bg: string;
  icon: LucideIcon;
}

interface AttendanceResults {
  name: string;
  regNum: string;
  total: number;
  present: number;
  absent: number;
  od: number;
  percentage: string;
  records: AttendanceRecord[];
  safeLeaves: number;
  status: string;
}

const Attendance: React.FC = () => {
  const { user } = useAuth();
  const [reg, setReg] = useState(user?.regNum || '');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<AttendanceResults | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState('');
  
  // Leave Calculator State
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [absentDates, setAbsentDates] = useState<string[]>([]);

  useEffect(() => {
    setAbsentDates([]);
  }, [leaveStartDate, leaveEndDate]);

  const fetchAttendance = useCallback(async (targetReg: string) => {
    if (!targetReg) return;

    setIsLoading(true);
    setError('');

    try {
      const student = students.find(s => s.regNum === targetReg);
      if (!student) {
        throw new Error('Student not found.');
      }

      const snap = await getDocs(collection(db, 'attendance'));
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
      const records: AttendanceRecord[] = [];

      filtered.forEach(d => {
        const data = d.data();
        const dateStr = d.id;
        
        if (data.absents?.includes(targetReg)) {
          absentCount++;
          records.push({ date: dateStr, type: 'Absent', color: 'text-red-500 dark:text-red-400', bg: 'neu-inset', icon: XCircle });
        }
        if (data.internal_od?.includes(targetReg)) {
          intODCount++;
          records.push({ date: dateStr, type: 'Internal OD', color: 'text-yellow-600 dark:text-yellow-400', bg: 'neu-inset', icon: Briefcase });
        }
        if (data.external_od?.includes(targetReg)) {
          extODCount++;
          records.push({ date: dateStr, type: 'External OD', color: 'text-blue-500 dark:text-blue-400', bg: 'neu-inset', icon: ShieldCheck });
        }
      });

      const present = total - absentCount;
      const percentage = total > 0 ? (present / total) * 100 : 0;
      const safeLeaves = Math.max(0, Math.floor((present - 0.75 * total) / 0.75));

      setResults({
        name: student.name,
        regNum: student.regNum,
        total,
        present,
        absent: absentCount,
        od: intODCount + extODCount,
        percentage: percentage.toFixed(2),
        records: records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        safeLeaves,
        status: percentage >= 75 ? (percentage >= 85 ? 'Excellent' : 'Good') : (percentage >= 65 ? 'Warning' : 'Critical')
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    if (user?.regNum) {
      fetchAttendance(user.regNum);
    }
  }, [user, fetchAttendance]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    fetchAttendance(reg);
  };

  const getProjectedAttendance = useCallback(() => {
    if (!results || !leaveStartDate || !leaveEndDate) return null;

    const start = new Date(leaveStartDate);
    const end = new Date(leaveEndDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return null;
    }

    const classDates: string[] = [];
    const current = new Date(start);
    while (current <= end) {
      const day = current.getDay();
      const isWeekend = day === 0 || day === 6; // 0 = Sunday, 6 = Saturday

      if (!isWeekend) {
        const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, '0');
        const dateVal = String(current.getDate()).padStart(2, '0');
        classDates.push(`${year}-${month}-${dateVal}`);
      }
      current.setDate(current.getDate() + 1);
    }

    let projectedTotal = results.total;
    let projectedPresent = results.present;
    let projectedAbsent = results.absent;

    classDates.forEach(dateStr => {
      const isSimulatedAbsent = absentDates.includes(dateStr);
      const existingRecord = results.records.find(r => r.date === dateStr);

      if (existingRecord) {
        if (existingRecord.type === 'Absent') {
          if (!isSimulatedAbsent) {
            projectedPresent += 1;
            projectedAbsent = Math.max(0, projectedAbsent - 1);
          }
        } else {
          if (isSimulatedAbsent) {
            projectedPresent = Math.max(0, projectedPresent - 1);
            projectedAbsent += 1;
          }
        }
      } else {
        projectedTotal += 1;
        if (isSimulatedAbsent) {
          projectedAbsent += 1;
        } else {
          projectedPresent += 1;
        }
      }
    });

    const projectedPercentage = projectedTotal > 0 ? (projectedPresent / projectedTotal) * 100 : 0;
    const projectedSafeLeaves = Math.max(0, Math.floor((projectedPresent - 0.75 * projectedTotal) / 0.75));

    let projectedStatus = 'Critical';
    if (projectedPercentage >= 75) {
      projectedStatus = projectedPercentage >= 85 ? 'Excellent' : 'Good';
    } else if (projectedPercentage >= 65) {
      projectedStatus = 'Warning';
    }

    return {
      classDates,
      total: projectedTotal,
      present: projectedPresent,
      absent: projectedAbsent,
      percentage: projectedPercentage.toFixed(2),
      status: projectedStatus,
      safeLeaves: projectedSafeLeaves
    };
  }, [results, leaveStartDate, leaveEndDate, absentDates]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Excellent': return 'text-emerald-500 dark:text-emerald-400 bg-emerald-500/10';
      case 'Good': return 'text-blue-500 dark:text-blue-400 bg-blue-500/10';
      case 'Warning': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/10';
      case 'Critical': return 'text-red-500 dark:text-red-400 bg-red-500/10';
      default: return 'text-text-secondary bg-bg-secondary';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short'
    });
  };

  const projected = getProjectedAttendance();

  return (
    <div className="space-y-6 max-w-lg md:max-w-5xl mx-auto">
      <h1 className="text-2xl font-black text-text-primary px-2 pt-2">Attendance</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column */}
        <div className="md:col-span-5 space-y-6">
          {/* Search Section */}
          <section className="neu-flat rounded-3xl p-6 border border-border-color/10">
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
                    className="w-full neu-input rounded-2xl py-3 pl-12 pr-4 text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none transition-all font-mono"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-between w-full text-[10px] font-bold uppercase tracking-widest text-text-secondary px-2 cursor-pointer hover:text-text-primary"
              >
                <div className="flex items-center gap-2">
                  <Filter size={12} /> Filters
                </div>
                <ChevronDown size={12} className={clsx("transition-transform duration-300", showFilters && "rotate-180")} />
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
                        <label className="text-[9px] uppercase font-bold text-text-secondary ml-2 tracking-wider">From</label>
                        <input
                          type="date"
                          value={fromDate}
                          onChange={(e) => setFromDate(e.target.value)}
                          className="w-full neu-input rounded-xl py-3 px-3 text-sm outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-text-secondary ml-2 tracking-wider">To</label>
                        <input
                          type="date"
                          value={toDate}
                          onChange={(e) => setToDate(e.target.value)}
                          className="w-full neu-input rounded-xl py-3 px-3 text-sm outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full neu-btn text-accent-blue font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-sm"
              >
                {isLoading ? <Database className="animate-spin" size={18} /> : <Search size={18} />}
                {isLoading ? 'Fetching...' : 'Check Attendance'}
              </button>
            </form>
          </section>

          {/* Stats if loaded */}
          {results && (
            <div className="space-y-6">
              {/* Circular Progress & Major Stats */}
              <div className="neu-flat rounded-3xl p-6 flex flex-col items-center border border-border-color/10">
                <div className="relative w-40 h-40 mb-6">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle
                      className="text-bg-secondary"
                      strokeWidth="3.2"
                      stroke="currentColor"
                      fill="transparent"
                      r="15.9155"
                      cx="18"
                      cy="18"
                    />
                    <circle
                      className="text-accent-blue transition-all duration-1000 ease-out"
                      strokeWidth="3.2"
                      strokeDasharray={`${results.percentage}, 100`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="15.9155"
                      cx="18"
                      cy="18"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black">{results.percentage}%</span>
                    <span className={clsx("text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full mt-1.5 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.1)]", getStatusColor(results.status))}>
                      {results.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 w-full">
                  <div className="text-center py-2 rounded-xl bg-bg-secondary/40 border border-border-color">
                    <p className="text-lg font-extrabold">{results.total}</p>
                    <p className="text-[9px] text-text-secondary uppercase font-bold tracking-wider">Days</p>
                  </div>
                  <div className="text-center py-2 rounded-xl bg-bg-secondary/40 border border-border-color">
                    <p className="text-lg font-extrabold text-emerald-500 dark:text-emerald-400">{results.present}</p>
                    <p className="text-[9px] text-text-secondary uppercase font-bold tracking-wider">Pres</p>
                  </div>
                  <div className="text-center py-2 rounded-xl bg-bg-secondary/40 border border-border-color">
                    <p className="text-lg font-extrabold text-red-500 dark:text-red-400">{results.absent}</p>
                    <p className="text-[9px] text-text-secondary uppercase font-bold tracking-wider">Abs</p>
                  </div>
                  <div className="text-center py-2 rounded-xl bg-bg-secondary/40 border border-border-color">
                    <p className="text-lg font-extrabold text-accent-purple">{results.od}</p>
                    <p className="text-[9px] text-text-secondary uppercase font-bold tracking-wider">OD</p>
                  </div>
                </div>
              </div>

              {/* Safe Leaves Banner */}
              <div className={clsx(
                "p-5 rounded-3xl neu-flat flex items-center gap-4 border-l-4 border border-border-color/10",
                results.safeLeaves > 0 ? "border-l-emerald-500" : "border-l-red-500"
              )}>
                <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 neu-inset", results.safeLeaves > 0 ? "text-emerald-500 dark:text-emerald-400" : "text-red-500 dark:text-red-400")}>
                  <TrendingUp size={22} />
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary">
                    {results.safeLeaves > 0 
                      ? `You can take ${results.safeLeaves} more leave(s).` 
                      : "No more leaves allowed."}
                  </p>
                  <p className="text-[9px] text-text-secondary uppercase tracking-widest font-bold mt-0.5">Safe Leave Balance</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="md:col-span-7 space-y-6">
          <AnimatePresence mode="wait">
            {results ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 h-full flex flex-col"
              >
                {/* Leave Calculator */}
                <section className="neu-flat rounded-3xl p-6 border border-border-color/10 space-y-4">
                  <div className="flex items-center gap-2 text-text-secondary border-b border-border-color/10 pb-3">
                    <Calculator size={18} className="text-accent-blue" />
                    <h3 className="text-xs font-bold uppercase tracking-widest">Leave Calculator</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-text-secondary ml-2 tracking-wider">Start Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/40 pointer-events-none" size={14} />
                        <input
                          type="date"
                          value={leaveStartDate}
                          onChange={(e) => setLeaveStartDate(e.target.value)}
                          className="w-full neu-input rounded-xl py-2.5 pl-9 pr-3 text-xs outline-none transition-colors text-text-primary min-h-[42px]"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-text-secondary ml-2 tracking-wider">End Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/40 pointer-events-none" size={14} />
                        <input
                          type="date"
                          value={leaveEndDate}
                          onChange={(e) => setLeaveEndDate(e.target.value)}
                          className="w-full neu-input rounded-xl py-2.5 pl-9 pr-3 text-xs outline-none transition-colors text-text-primary min-h-[42px]"
                        />
                      </div>
                    </div>
                  </div>

                  {projected ? (
                    <div className="space-y-4 pt-2">
                      {projected.classDates.length > 0 ? (
                        <div className="space-y-2">
                          <label className="text-[9px] uppercase font-bold text-text-secondary ml-2 tracking-wider">
                            Toggle Days to Mark as Absent
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                            {projected.classDates.map((dateStr) => {
                              const isAbsent = absentDates.includes(dateStr);
                              return (
                                <button
                                  key={dateStr}
                                  type="button"
                                  onClick={() => {
                                    if (isAbsent) {
                                      setAbsentDates(absentDates.filter(d => d !== dateStr));
                                    } else {
                                      setAbsentDates([...absentDates, dateStr]);
                                    }
                                  }}
                                  className={clsx(
                                    "flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-sm",
                                    isAbsent
                                      ? "bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20"
                                      : "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                                  )}
                                >
                                  <span>{formatDate(dateStr)}</span>
                                  <span className="text-[8px] uppercase tracking-wider font-semibold opacity-75 mt-0.5">
                                    {isAbsent ? "Absent" : "Attended"}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-3 bg-bg-secondary/40 rounded-xl border border-border-color text-xs font-semibold text-text-secondary">
                          No class days found in the selected range (excluding weekends).
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-bg-secondary/40 border border-border-color">
                        <div>
                          <p className="text-[9px] text-text-secondary uppercase font-bold tracking-wider">Attended Days</p>
                          <p className="text-xl font-extrabold text-text-primary mt-0.5">
                            {projected.classDates.length - absentDates.filter(d => projected.classDates.includes(d)).length} / {projected.classDates.length}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] text-text-secondary uppercase font-bold tracking-wider">Projected Attendance</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs line-through text-text-secondary">{results.percentage}%</span>
                            <span className={clsx("text-base font-black px-2 py-0.5 rounded-lg", getStatusColor(projected.status))}>
                              {projected.percentage}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {parseFloat(projected.percentage) < 75 ? (
                        <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20 text-xs font-semibold leading-relaxed">
                          <AlertTriangle className="shrink-0 mt-0.5" size={16} />
                          <span>Warning: Attendance will drop below the required 75% threshold!</span>
                        </div>
                      ) : parseFloat(projected.percentage) < 85 ? (
                        <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 text-xs font-semibold leading-relaxed">
                          <AlertTriangle className="shrink-0 mt-0.5" size={16} />
                          <span>Note: Attendance will drop below the recommended 85% safety threshold.</span>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold leading-relaxed">
                          <CheckCircle2 className="shrink-0 mt-0.5" size={16} />
                          <span>Great! Your attendance will remain safe and above 85%.</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center p-4 bg-bg-secondary/20 rounded-2xl border border-dashed border-border-color/60">
                      <p className="text-[10px] text-text-secondary font-medium uppercase tracking-wider">Select a valid start & end date to calculate projected attendance</p>
                    </div>
                  )}
                </section>

                {/* History List */}
                <div className="space-y-3 flex flex-col h-[300px]">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary px-2 flex-shrink-0">History</h3>
                  {results.records.length > 0 ? (
                    <div className="space-y-3 overflow-y-auto pr-1 custom-scrollbar flex-grow pb-4 mask-gradient-bottom">
                      {results.records.map((record, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 neu-flat rounded-2xl shrink-0 border border-border-color/10">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center neu-inset shrink-0">
                              <record.icon size={16} className={record.color} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-text-primary">{formatDate(record.date)}</p>
                              <p className={clsx("text-[9px] font-bold uppercase tracking-wider mt-0.5", record.color)}>{record.type}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center neu-flat rounded-3xl border border-dashed border-border-color/40 flex flex-col items-center justify-center">
                      <CheckCircle2 className="text-text-secondary opacity-35 mb-2" size={32} />
                      <p className="text-xs text-text-secondary">No leave records found.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : error ? (
              <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-3xl">
                <AlertTriangle className="mx-auto text-red-500 dark:text-red-400 mb-2" size={32} />
                <p className="text-sm font-bold text-red-500 dark:text-red-400">{error}</p>
              </div>
            ) : (
              <div className="p-12 text-center flex flex-col items-center justify-center neu-flat rounded-3xl border border-border-color/10 h-64">
                <div className="w-16 h-16 neu-inset rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="text-text-secondary/40" size={26} />
                </div>
                <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Search to view results</p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default Attendance;
