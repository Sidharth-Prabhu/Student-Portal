import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Terminal, 
  Users, 
  UserPlus, 
  Activity, 
  Loader2,
  AlertCircle,
  Check,
  ChevronLeft,
  Search
} from 'lucide-react';
import { db, secondaryAuth } from '../lib/firebase';
import { collection, getDocs, orderBy, query, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { students } from '../data/students';
import { clsx } from 'clsx';

interface UserLog {
  id: string;
  name: string;
  reg: string;
  lastAction: string;
  lastDate: string;
  lastTimestamp: unknown;
}

const DevConsole: React.FC = () => {
  const [logs, setLogs] = useState<UserLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [todayVisits, setTodayVisits] = useState(0);
  const [activeTab, setActiveTab] = useState<'analytics' | 'add_admin'>('analytics');
  const navigate = useNavigate();

  // New Admin Form State
  const [password, setPassword] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<typeof students[0] | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [adminStatus, setAdminStatus] = useState<{ type: 'error' | 'success', message: string } | null>(null);

  const fetchLogs = useCallback(async () => {
    setIsLoadingLogs(true);
    try {
      const q = query(collection(db, 'user_logs'), orderBy('lastTimestamp', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserLog));
      setLogs(data);

      const todayStr = new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
      const visitsToday = data.filter(log => log.lastDate && log.lastDate.startsWith(todayStr)).length;
      setTodayVisits(visitsToday);
    } catch (e) {
      console.error('Failed to fetch logs:', e);
    } finally {
      setIsLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'analytics') fetchLogs();
  }, [activeTab, fetchLogs]);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !password) {
      setAdminStatus({ type: 'error', message: 'Please select a student and enter a password.' });
      return;
    }
    
    setIsCreatingAdmin(true);
    setAdminStatus(null);
    try {
      const { email, regNum } = selectedStudent;
      
      // 1. Create in Firebase Auth
      await createUserWithEmailAndPassword(secondaryAuth, email, password);
      await secondaryAuth.signOut();
      
      // 2. Add to authorized_admins collection
      await setDoc(doc(db, 'authorized_admins', regNum), {
        email,
        regNum,
        addedAt: new Date().toISOString()
      });

      setAdminStatus({ type: 'success', message: `Admin access granted to ${selectedStudent.name} (${regNum}).` });
      setSelectedStudent(null);
      setPassword('');
      setStudentSearch('');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to grant admin access.";
      setAdminStatus({ type: 'error', message: errorMessage });
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
    s.regNum.includes(studentSearch)
  ).slice(0, 5);

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-bg-card border border-border-color rounded-xl">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Terminal className="text-red-400" /> 
          Developer Console
        </h1>
      </div>

      <div className="flex p-1 bg-bg-card border border-border-color rounded-2xl shadow-lg">
        <button
          onClick={() => setActiveTab('analytics')}
          className={clsx(
            "flex-grow py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
            activeTab === 'analytics' ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "text-text-secondary"
          )}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('add_admin')}
          className={clsx(
            "flex-grow py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
            activeTab === 'add_admin' ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "text-text-secondary"
          )}
        >
          Add Admin
        </button>
      </div>

      {activeTab === 'analytics' ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <section className="bg-bg-card border border-border-color rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden text-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 shadow-inner">
                <Activity size={32} />
              </div>
              <div>
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Today's Visits</p>
                <h2 className="text-4xl font-black text-white">{isLoadingLogs ? '-' : todayVisits}</h2>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 px-2">
              <Users size={16} className="text-text-secondary" />
              <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary">Recent Visitors</h3>
            </div>

            {isLoadingLogs ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="animate-spin text-red-400" size={32} />
                <p className="text-sm text-text-secondary">Loading visitor logs...</p>
              </div>
            ) : (
              <div className="bg-bg-card border border-border-color rounded-3xl overflow-hidden shadow-lg divide-y divide-border-color/50">
                {logs.length === 0 ? (
                  <div className="p-8 text-center text-text-secondary">
                    <p className="text-sm font-bold">No logs found.</p>
                  </div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="p-4 flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-sm truncate max-w-[200px]">{log.name || 'Unknown'}</p>
                        <span className={clsx(
                          "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border",
                          log.lastAction === 'login_react' ? "bg-emerald-500/10 border-emerald-400/20 text-emerald-400" : "bg-blue-500/10 border-blue-400/20 text-blue-400"
                        )}>
                          {log.lastAction === 'login_react' ? 'LOGIN' : 'VISIT'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-text-secondary font-mono">
                        <p>{log.reg}</p>
                        <p>{log.lastDate}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </section>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <section className="bg-bg-card border border-border-color rounded-3xl p-6 shadow-xl">
            <div className="mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <UserPlus size={24} className="text-red-400" />
                Authorize Faculty
              </h2>
              <p className="text-xs text-text-secondary mt-1">Promote an existing student to Administrator. This will use their official college email.</p>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-6">
              {/* Student Search & Selection */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-text-secondary ml-1">Select Faculty/Student</label>
                {selectedStudent ? (
                  <div className="flex items-center justify-between p-4 bg-bg-secondary border border-accent-blue/30 rounded-xl">
                    <div>
                      <p className="text-sm font-bold">{selectedStudent.name}</p>
                      <p className="text-[10px] text-text-secondary font-mono">{selectedStudent.regNum}</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setSelectedStudent(null)}
                      className="p-2 text-text-secondary hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4" />
                      <input
                        type="text"
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        placeholder="Search by name or roll number..."
                        className="w-full bg-bg-secondary border border-border-color rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-red-400 transition-all text-sm"
                      />
                    </div>
                    {studentSearch && (
                      <div className="bg-bg-card border border-border-color rounded-xl overflow-hidden shadow-xl divide-y divide-border-color/50">
                        {filteredStudents.map(s => (
                          <button
                            key={s.regNum}
                            type="button"
                            onClick={() => {
                              setSelectedStudent(s);
                              setStudentSearch('');
                            }}
                            className="w-full p-3 text-left hover:bg-bg-secondary transition-colors flex flex-col"
                          >
                            <span className="text-sm font-bold">{s.name}</span>
                            <span className="text-[10px] text-text-secondary font-mono">{s.regNum}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-text-secondary ml-1">Assign Admin Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-bg-secondary border border-border-color rounded-xl py-3 px-4 focus:outline-none focus:border-red-400 transition-all text-sm"
                  required
                  minLength={6}
                />
              </div>

              {adminStatus && (
                <div className={clsx(
                  "p-3 rounded-xl flex items-center gap-2 text-xs font-bold",
                  adminStatus.type === 'error' ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                )}>
                  {adminStatus.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
                  <p>{adminStatus.message}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isCreatingAdmin || !selectedStudent}
                className="w-full bg-gradient-to-r from-red-500 to-orange-600 text-white font-bold py-3.5 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
              >
                {isCreatingAdmin ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
                {isCreatingAdmin ? 'Processing...' : 'Grant Admin Access'}
              </button>
            </form>
          </section>
        </motion.div>
      )}
    </div>
  );
};

// Add X import for the cancel button
const X: React.FC<{className?: string}> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

export default DevConsole;
