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
      
      await createUserWithEmailAndPassword(secondaryAuth, email, password);
      await secondaryAuth.signOut();
      
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
    <div className="space-y-6 max-w-lg md:max-w-5xl mx-auto pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2.5 neu-btn rounded-xl flex items-center justify-center text-text-secondary hover:text-text-primary"
        >
          <ChevronLeft size={18} />
        </button>
        <h1 className="text-xl font-bold flex items-center gap-2 text-text-primary">
          <Terminal className="text-red-500" size={20} /> 
          Developer Console
        </h1>
      </div>

      {/* Tabs - Hidden on Desktop */}
      <div className="flex p-1.5 neu-inset rounded-2xl md:hidden">
        <button
          onClick={() => setActiveTab('analytics')}
          className={clsx(
            "flex-grow py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer",
            activeTab === 'analytics' 
              ? "neu-flat text-red-500 font-black" 
              : "text-text-secondary hover:text-text-primary"
          )}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('add_admin')}
          className={clsx(
            "flex-grow py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer",
            activeTab === 'add_admin' 
              ? "neu-flat text-red-500 font-black" 
              : "text-text-secondary hover:text-text-primary"
          )}
        >
          Add Admin
        </button>
      </div>

      {/* Desktop view: side-by-side dashboard */}
      <div className="hidden md:grid grid-cols-12 gap-6">
        
        {/* Left Column: Analytics */}
        <div className="col-span-6 space-y-6">
          <section className="neu-flat rounded-3xl p-8 relative overflow-hidden text-center border border-border-color/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl rounded-full"></div>
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl neu-inset flex items-center justify-center text-red-500">
                <Activity size={28} />
              </div>
              <div>
                <p className="text-[9px] font-black text-text-secondary uppercase tracking-wider mb-1">Today's Visits</p>
                <h2 className="text-4xl font-black text-text-primary">{isLoadingLogs ? '-' : todayVisits}</h2>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 px-2">
              <Users size={16} className="text-text-secondary" />
              <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary">Recent Visitors</h3>
            </div>

            {isLoadingLogs ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 neu-flat rounded-3xl border border-border-color/10">
                <Loader2 className="animate-spin text-red-500" size={28} />
                <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Loading visitor logs...</p>
              </div>
            ) : (
              <div className="neu-flat rounded-3xl overflow-hidden divide-y divide-border-color/15 border border-border-color/10 shadow-lg">
                {logs.length === 0 ? (
                  <div className="p-8 text-center text-text-secondary bg-transparent">
                    <p className="text-xs text-text-secondary">No logs found.</p>
                  </div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="p-4 flex flex-col gap-1.5 bg-transparent">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-sm text-text-primary truncate max-w-[200px]">{log.name || 'Unknown'}</p>
                        <span className={clsx(
                          "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border",
                          log.lastAction === 'login_react' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 dark:text-emerald-400" : "bg-blue-500/10 border-blue-500/20 text-blue-500 dark:text-blue-400"
                        )}>
                          {log.lastAction === 'login_react' ? 'LOGIN' : 'VISIT'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-text-secondary font-mono mt-0.5">
                        <p>{log.reg}</p>
                        <p>{log.lastDate}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Authorize Faculty Form */}
        <div className="col-span-6 space-y-6">
          <section className="neu-flat rounded-3xl p-6 border border-border-color/10">
            <div className="mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-text-primary">
                <UserPlus size={22} className="text-red-500" />
                Authorize Faculty
              </h2>
              <p className="text-xs text-text-secondary mt-2.5 leading-relaxed">Promote an existing student to Administrator. This will use their official college email.</p>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] uppercase font-bold text-text-secondary ml-1 tracking-wider">Select Faculty/Student</label>
                {selectedStudent ? (
                  <div className="flex items-center justify-between p-4 neu-inset rounded-xl border border-accent-blue/20">
                    <div>
                      <p className="text-sm font-bold text-text-primary">{selectedStudent.name}</p>
                      <p className="text-[10px] text-text-secondary font-mono mt-0.5">{selectedStudent.regNum}</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setSelectedStudent(null)}
                      className="p-2 text-text-secondary hover:text-red-500 transition-colors cursor-pointer"
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
                        className="w-full neu-input rounded-xl py-3.5 pl-11 pr-4 text-sm text-text-primary"
                      />
                    </div>
                    {studentSearch && (
                      <div className="neu-flat rounded-xl overflow-hidden divide-y divide-border-color/15 border border-border-color/10 mt-1 shadow-lg">
                        {filteredStudents.map(s => (
                          <button
                            key={s.regNum}
                            type="button"
                            onClick={() => {
                              setSelectedStudent(s);
                              setStudentSearch('');
                            }}
                            className="w-full p-3 text-left hover:bg-bg-primary/40 transition-colors flex flex-col cursor-pointer"
                          >
                            <span className="text-sm font-bold text-text-primary">{s.name}</span>
                            <span className="text-[10px] text-text-secondary font-mono mt-0.5">{s.regNum}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[9px] uppercase font-bold text-text-secondary ml-1 tracking-wider">Assign Admin Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full neu-input rounded-xl py-3.5 px-4 text-sm text-text-primary"
                  required
                  minLength={6}
                />
              </div>

              {adminStatus && (
                <div className={clsx(
                  "p-3 rounded-xl flex items-center gap-2 text-xs font-bold border",
                  adminStatus.type === 'error' ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                )}>
                  {adminStatus.type === 'error' ? <AlertCircle size={16} className="shrink-0" /> : <Check size={16} className="shrink-0" />}
                  <p>{adminStatus.message}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isCreatingAdmin || !selectedStudent}
                className="w-full neu-btn text-red-500 font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm border border-border-color/10"
              >
                {isCreatingAdmin ? <Loader2 className="animate-spin text-red-500 shrink-0" size={18} /> : <UserPlus size={18} className="shrink-0" />}
                {isCreatingAdmin ? 'Processing...' : 'Grant Admin Access'}
              </button>
            </form>
          </section>
        </div>

      </div>

      {/* Mobile view: tabbed dashboard */}
      <div className="md:hidden">
        {activeTab === 'analytics' ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <section className="neu-flat rounded-3xl p-8 relative overflow-hidden text-center border border-border-color/10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl rounded-full"></div>
              <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl neu-inset flex items-center justify-center text-red-500">
                  <Activity size={28} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-text-secondary uppercase tracking-wider mb-1">Today's Visits</p>
                  <h2 className="text-4xl font-black text-text-primary">{isLoadingLogs ? '-' : todayVisits}</h2>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2 px-2">
                <Users size={16} className="text-text-secondary" />
                <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary">Recent Visitors</h3>
              </div>

              {isLoadingLogs ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 neu-flat rounded-3xl border border-border-color/10">
                  <Loader2 className="animate-spin text-red-500" size={28} />
                  <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Loading visitor logs...</p>
                </div>
              ) : (
                <div className="neu-flat rounded-3xl overflow-hidden divide-y divide-border-color/15 border border-border-color/10 shadow-lg">
                  {logs.length === 0 ? (
                    <div className="p-8 text-center text-text-secondary bg-transparent">
                      <p className="text-xs text-text-secondary">No logs found.</p>
                    </div>
                  ) : (
                    logs.map((log) => (
                      <div key={log.id} className="p-4 flex flex-col gap-1.5 bg-transparent">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-sm text-text-primary truncate max-w-[200px]">{log.name || 'Unknown'}</p>
                          <span className={clsx(
                            "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border",
                            log.lastAction === 'login_react' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 dark:text-emerald-400" : "bg-blue-500/10 border-blue-500/20 text-blue-500 dark:text-blue-400"
                          )}>
                            {log.lastAction === 'login_react' ? 'LOGIN' : 'VISIT'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-text-secondary font-mono mt-0.5">
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
            <section className="neu-flat rounded-3xl p-6 border border-border-color/10">
              <div className="mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-text-primary">
                  <UserPlus size={22} className="text-red-500" />
                  Authorize Faculty
                </h2>
                <p className="text-xs text-text-secondary mt-2.5 leading-relaxed">Promote an existing student to Administrator. This will use their official college email.</p>
              </div>

              <form onSubmit={handleCreateAdmin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-bold text-text-secondary ml-1 tracking-wider">Select Faculty/Student</label>
                  {selectedStudent ? (
                    <div className="flex items-center justify-between p-4 neu-inset rounded-xl border border-accent-blue/20">
                      <div>
                        <p className="text-sm font-bold text-text-primary">{selectedStudent.name}</p>
                        <p className="text-[10px] text-text-secondary font-mono mt-0.5">{selectedStudent.regNum}</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setSelectedStudent(null)}
                        className="p-2 text-text-secondary hover:text-red-500 transition-colors cursor-pointer"
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
                          className="w-full neu-input rounded-xl py-3.5 pl-11 pr-4 text-sm text-text-primary"
                        />
                      </div>
                      {studentSearch && (
                        <div className="neu-flat rounded-xl overflow-hidden divide-y divide-border-color/15 border border-border-color/10 mt-1 shadow-lg">
                          {filteredStudents.map(s => (
                            <button
                              key={s.regNum}
                              type="button"
                              onClick={() => {
                                setSelectedStudent(s);
                                setStudentSearch('');
                              }}
                              className="w-full p-3 text-left hover:bg-bg-primary/40 transition-colors flex flex-col cursor-pointer"
                            >
                              <span className="text-sm font-bold text-text-primary">{s.name}</span>
                              <span className="text-[10px] text-text-secondary font-mono mt-0.5">{s.regNum}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-bold text-text-secondary ml-1 tracking-wider">Assign Admin Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full neu-input rounded-xl py-3.5 px-4 text-sm text-text-primary"
                    required
                    minLength={6}
                  />
                </div>

                {adminStatus && (
                  <div className={clsx(
                    "p-3 rounded-xl flex items-center gap-2 text-xs font-bold border",
                    adminStatus.type === 'error' ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  )}>
                    {adminStatus.type === 'error' ? <AlertCircle size={16} className="shrink-0" /> : <Check size={16} className="shrink-0" />}
                    <p>{adminStatus.message}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isCreatingAdmin || !selectedStudent}
                  className="w-full neu-btn text-red-500 font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm border border-border-color/10"
                >
                  {isCreatingAdmin ? <Loader2 className="animate-spin text-red-500 shrink-0" size={18} /> : <UserPlus size={18} className="shrink-0" />}
                  {isCreatingAdmin ? 'Processing...' : 'Grant Admin Access'}
                </button>
              </form>
            </section>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Add X import for the cancel button
const X: React.FC<{className?: string}> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

export default DevConsole;
