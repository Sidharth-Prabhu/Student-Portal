import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UserCheck,
  ClipboardList,
  PieChart,
  Database,
  ArrowRight,
  TrendingUp,
  Award,
  ShieldCheck,
  Lock,
  Terminal,
  Clock,
  Calculator,
  Calendar,
  MapPin,
  Search
} from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, getDocs, onSnapshot, DocumentSnapshot, FirestoreError } from 'firebase/firestore';
import { clsx } from 'clsx';

const adminActions = [
  {
    title: 'Attendance Records',
    desc: 'View & verify logs',
    icon: UserCheck,
    path: '/mark-attendance',
    iconColor: 'text-blue-400'
  },
  {
    title: 'View Attendance',
    desc: 'Analytics & Reports',
    icon: ClipboardList,
    path: '/view-attendance',
    iconColor: 'text-emerald-400'
  },
  {
    title: 'Today\'s Summary',
    desc: 'Quick overview',
    icon: PieChart,
    path: '/summary',
    iconColor: 'text-purple-400'
  },
  {
    title: 'Database Viewer',
    desc: 'Collections & Records',
    icon: Database,
    path: '/database-manager',
    iconColor: 'text-orange-400'
  }
];

const quickLinks = [
  {
    title: 'My Attendance',
    path: '/attendance',
    icon: Calendar,
    color: 'bg-emerald-400/10',
    iconColor: 'text-emerald-400'
  },
  {
    title: 'Daily Timetable',
    path: '/timetable',
    icon: Clock,
    color: 'bg-accent-blue/10',
    iconColor: 'text-accent-blue'
  },
  {
    title: 'Grades Calc',
    path: '/cgpa',
    icon: Calculator,
    color: 'bg-accent-purple/10',
    iconColor: 'text-accent-purple'
  }
];

const Dashboard: React.FC = () => {
  const { user, isAdmin, isDev, isEligibleForAdmin } = useAuth();
  const [displayCgpa, setDisplayCgpa] = useState<string | null>(null);
  const [isLoadingCgpa, setIsLoadingCgpa] = useState(true);
  const [attendanceStatus, setAttendanceStatus] = useState<{ label: string, color: string } | null>(null);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(true);
  // const [seatingData, setSeatingData] = useState<{ date: string; hallNo: string; seatNo: string; courseCode: string } | null>(null);
  // const [isLoadingSeating, setIsLoadingSeating] = useState(true);

  // const [seatingSearchReg, setSeatingSearchReg] = useState('');
  // const [activeSeatingReg, setActiveSeatingReg] = useState('');

  /*
  useEffect(() => {
    if (user?.regNum && !activeSeatingReg) {
      setActiveSeatingReg(user.regNum);
    }
  }, [user, activeSeatingReg]);

  useEffect(() => {
    if (!activeSeatingReg) return;
    
    setIsLoadingSeating(true);
    const docRef = doc(db, 'seating_allocations', activeSeatingReg);
    
    const unsubscribe = onSnapshot(docRef, (docSnap: DocumentSnapshot) => {
      if (docSnap.exists()) {
        setSeatingData(docSnap.data() as any);
      } else {
        setSeatingData(null);
      }
      setIsLoadingSeating(false);
    }, (error: FirestoreError) => {
      console.error("Seating fetch error", error);
      setIsLoadingSeating(false);
    });

    return () => unsubscribe();
  }, [activeSeatingReg]);
  */

  const visibleActions = isDev ? [
    ...adminActions,
    {
      title: 'Developer Console',
      desc: 'System analytics & tools',
      icon: Terminal,
      path: '/dev-console',
      iconColor: 'text-red-400'
    }
  ] : adminActions;

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const fetchCgpa = async () => {
        try {
          const docRef = doc(db, 'user_logs', user.regNum, 'academic_records', 'current');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const cloudCgpa = docSnap.data().cgpa;
            if (cloudCgpa !== undefined) {
              setDisplayCgpa(Number(cloudCgpa).toFixed(2));
            }
          }
        } catch (e) {
          console.error("Dashboard cloud fetch error", e);
        } finally {
          setIsLoadingCgpa(false);
        }
      };

      const fetchAttendance = async () => {
        try {
          const snap = await getDocs(collection(db, 'semester_4'));
          const docs = snap.docs;
          const total = docs.length;

          if (total === 0) {
            setAttendanceStatus({ label: 'N/A', color: 'text-text-secondary' });
            return;
          }

          let absentCount = 0;
          docs.forEach(d => {
            const data = d.data();
            if (data.absents?.includes(user.regNum)) {
              absentCount++;
            }
          });

          const present = total - absentCount;
          const percentage = (present / total) * 100;

          let label = 'Good';
          let color = 'text-blue-400';

          if (percentage >= 85) { label = 'Excellent'; color = 'text-emerald-400'; }
          else if (percentage >= 75) { label = 'Good'; color = 'text-blue-400'; }
          else if (percentage >= 65) { label = 'Warning'; color = 'text-yellow-400'; }
          else { label = 'Critical'; color = 'text-red-400'; }

          setAttendanceStatus({ label, color });
        } catch (e) {
          console.error("Attendance fetch error", e);
          setAttendanceStatus({ label: 'Error', color: 'text-red-400' });
        } finally {
          setIsLoadingAttendance(false);
        }
      };

      await Promise.all([fetchCgpa(), fetchAttendance()]);
    };

    fetchData();
  }, [user]);

  return (
    <div className="space-y-8 max-w-lg mx-auto pb-8">
      {/* Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-bg-card border border-border-color p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Hi, <span className="gradient-text">{user?.name.split(' ')[0]}</span>
            </h1>
            <p className="text-text-secondary mt-2 text-sm">
              AI & DS • Semester 04 • Section E
            </p>
            <p className="text-[10px] text-text-secondary mt-1 font-mono">{user?.regNum}</p>
          </div>
          {isAdmin && (
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/20 shadow-lg">
              <ShieldCheck size={20} />
            </div>
          )}
        </div>
      </section>

      {/* Quick Stats Grid */}
      <section className="grid grid-cols-2 gap-4">
        <Link to="/attendance" className="bg-bg-card border border-border-color p-4 rounded-2xl flex flex-col gap-2 shadow-sm active:scale-95 transition-transform block text-left">
          <div className="w-8 h-8 rounded-lg bg-emerald-400/10 flex items-center justify-center text-emerald-400">
            <TrendingUp size={18} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-text-secondary tracking-widest font-mono text-left">Attendance</p>
            {isLoadingAttendance ? (
              <div className="h-6 w-16 bg-bg-secondary animate-pulse rounded mt-1"></div>
            ) : (
              <p className={clsx("text-xl font-bold", attendanceStatus?.color)}>{attendanceStatus?.label}</p>
            )}
          </div>
        </Link>

        {isLoadingCgpa ? (
          <div className="bg-bg-card border border-border-color p-4 rounded-2xl flex flex-col gap-2 shadow-sm animate-pulse">
            <div className="w-8 h-8 rounded-lg bg-bg-secondary"></div>
            <div className="h-2 w-12 bg-bg-secondary rounded"></div>
            <div className="h-4 w-16 bg-bg-secondary rounded"></div>
          </div>
        ) : (
          <Link to="/cgpa" className="bg-bg-card border border-border-color p-4 rounded-2xl flex flex-col gap-2 shadow-sm active:scale-95 transition-transform h-full block text-left">
            <div className="w-8 h-8 rounded-lg bg-accent-purple/10 flex items-center justify-center text-accent-purple">
              <Award size={18} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-text-secondary tracking-widest font-mono text-left">Current CGPA</p>
              <p className={clsx("font-bold text-white", displayCgpa ? "text-xl" : "text-sm")}>
                {displayCgpa || 'Calculate Now!'}
              </p>
            </div>
          </Link>
        )}

        <Link to="/exam-timetable" className="bg-bg-card border border-border-color p-4 rounded-2xl flex flex-col gap-2 shadow-sm active:scale-95 transition-transform block text-left">
          <div className="w-8 h-8 rounded-lg bg-accent-blue/10 flex items-center justify-center text-accent-blue">
            <Calendar size={18} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-text-secondary tracking-widest font-mono text-left">Schedule</p>
            <p className="font-bold text-white text-xl">
              End Semester
            </p>
          </div>
        </Link>
      </section>



      {/* Seating Widget 
      <section className="bg-bg-card border border-border-color p-5 rounded-3xl relative overflow-hidden shadow-xl group hover:border-accent-purple/30 transition-all">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent-purple/10 blur-3xl rounded-full group-hover:bg-accent-purple/20 transition-all"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-purple/10 flex items-center justify-center text-accent-purple shadow-inner">
                <MapPin size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-[10px] uppercase font-bold text-text-secondary tracking-widest font-mono">
                    {activeSeatingReg && activeSeatingReg !== user?.regNum ? `Seating for ${activeSeatingReg}` : 'Your Seating'}
                  </p>
                  <span className="px-2 py-[2px] rounded-full bg-accent-purple/20 text-[8px] font-bold text-accent-purple uppercase tracking-widest border border-accent-purple/30 animate-pulse">New</span>
                </div>
                <h2 className="text-sm font-bold text-white">{seatingData?.date ? `For ${seatingData.date}` : 'CAT - III'}</h2>
              </div>
            </div>
            {seatingData?.courseCode && (
              <div className="px-3 py-1 rounded-full bg-accent-purple/10 border border-accent-purple/20 text-[10px] font-mono font-bold text-accent-purple">
                {seatingData.courseCode}
              </div>
            )}
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (seatingSearchReg.trim()) {
                setActiveSeatingReg(seatingSearchReg.trim());
              } else {
                setActiveSeatingReg(user?.regNum || '');
              }
            }} 
            className="mb-4 flex gap-2 relative z-20"
          >
            <input 
              type="text" 
              placeholder="Search Reg No..." 
              value={seatingSearchReg}
              onChange={(e) => setSeatingSearchReg(e.target.value)}
              className="flex-grow bg-bg-secondary/80 border border-border-color rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent-purple/50 transition-colors placeholder:text-text-secondary/50"
            />
            <button type="submit" className="px-3 py-2 bg-accent-purple/10 text-accent-purple rounded-xl hover:bg-accent-purple/20 transition-colors flex items-center justify-center">
              <Search size={16} />
            </button>
            {activeSeatingReg && activeSeatingReg !== user?.regNum && (
              <button 
                type="button" 
                onClick={() => {
                  setSeatingSearchReg('');
                  setActiveSeatingReg(user?.regNum || '');
                }} 
                className="text-[10px] font-bold uppercase text-text-secondary hover:text-accent-purple transition-colors px-2"
              >
                Reset
              </button>
            )}
          </form>

          {isLoadingSeating ? (
            <div className="animate-pulse flex gap-3">
              <div className="h-16 w-full bg-bg-secondary rounded-2xl"></div>
              <div className="h-16 w-full bg-bg-secondary rounded-2xl"></div>
            </div>
          ) : seatingData ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-bg-secondary/40 border border-border-color p-4 rounded-2xl flex flex-col items-center justify-center hover:bg-bg-secondary/60 transition-colors">
                <p className="text-[10px] text-text-secondary uppercase tracking-widest mb-1 font-bold">Hall No</p>
                <p className="text-2xl font-black text-white">{seatingData.hallNo}</p>
              </div>
              <div className="bg-bg-secondary/40 border border-border-color p-4 rounded-2xl flex flex-col items-center justify-center hover:bg-bg-secondary/60 transition-colors">
                <p className="text-[10px] text-text-secondary uppercase tracking-widest mb-1 font-bold">Seat No</p>
                <p className="text-2xl font-black text-white">{seatingData.seatNo}</p>
              </div>
            </div>
          ) : (
            <div className="text-sm text-text-secondary p-4 text-center bg-bg-secondary/20 rounded-2xl border border-dashed border-border-color">
              No seating data found.
            </div>
          )}
        </div>
      </section>
      {/* Semester Exam Seating - Coming Soon */}
      <section className="bg-bg-card border border-border-color p-5 rounded-3xl relative overflow-hidden shadow-xl opacity-60 grayscale-[0.5]">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent-blue/5 blur-3xl rounded-full"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-bg-secondary flex items-center justify-center text-text-secondary shadow-inner">
                <MapPin size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-[10px] uppercase font-bold text-text-secondary tracking-widest font-mono">Semester Seating</p>
                  <span className="px-2 py-[2px] rounded-full bg-bg-secondary border border-border-color text-[8px] font-bold text-text-secondary uppercase tracking-widest">Coming Soon</span>
                </div>
                <h2 className="text-sm font-bold text-white">End Semester Exams</h2>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <div className="flex-grow bg-bg-secondary/40 border border-border-color rounded-xl px-3 py-2 text-xs text-text-secondary/50 flex items-center gap-2">
              <Search size={14} />
              Search Reg No...
            </div>
            <div className="px-3 py-2 bg-bg-secondary/40 text-text-secondary/50 rounded-xl border border-border-color flex items-center justify-center">
              <Search size={16} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-bg-secondary/20 border border-border-color/50 p-4 rounded-2xl flex flex-col items-center justify-center">
              <p className="text-[10px] text-text-secondary/50 uppercase tracking-widest mb-1 font-bold">Hall No</p>
              <p className="text-2xl font-black text-text-secondary/30">--</p>
            </div>
            <div className="bg-bg-secondary/20 border border-border-color/50 p-4 rounded-2xl flex flex-col items-center justify-center">
              <p className="text-[10px] text-text-secondary/50 uppercase tracking-widest mb-1 font-bold">Seat No</p>
              <p className="text-2xl font-black text-text-secondary/30">--</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Navigation Cards */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-text-secondary px-2">Quick Navigation</h2>
        <div className="grid grid-cols-3 gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="bg-bg-card border border-border-color p-4 rounded-2xl flex flex-col items-center gap-3 active:scale-95 transition-all shadow-sm hover:border-accent-blue/30"
            >
              <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center", link.color)}>
                <link.icon size={20} className={link.iconColor} />
              </div>
              <p className="text-[10px] font-bold text-center leading-tight">{link.title}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Admin Actions or Login */}
      {isEligibleForAdmin && (
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-secondary">
              {isAdmin ? 'Admin Console' : 'Faculty Access'}
            </h2>
          </div>

          {isAdmin ? (
            <div className="grid grid-cols-2 gap-4">
              {visibleActions.map((action, idx) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link
                    to={action.path}
                    className="flex flex-col gap-4 p-5 bg-bg-card border border-border-color rounded-3xl group hover:border-orange-500/50 transition-all active:scale-[0.98] shadow-lg text-left"
                  >
                    <div className={`w-12 h-12 rounded-2xl bg-bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <action.icon size={24} className={action.iconColor} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm leading-tight">{action.title}</h3>
                      <p className="text-[10px] text-text-secondary mt-1">{action.desc}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <Link
              to="/admin-login"
              className="flex items-center justify-between p-6 bg-bg-card border border-border-color rounded-[2.5rem] group hover:border-accent-blue/50 transition-all active:scale-[0.98] shadow-xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-bg-secondary flex items-center justify-center text-text-secondary group-hover:text-accent-blue transition-colors">
                  <Lock size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Login as Administrator</h3>
                  <p className="text-[10px] text-text-secondary mt-1">Unlock attendance marking and database tools</p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full border border-border-color flex items-center justify-center text-text-secondary group-hover:text-accent-blue group-hover:border-accent-blue/50 transition-all">
                <ArrowRight size={20} />
              </div>
            </Link>
          )}
        </section>
      )}
    </div>
  );
};

export default Dashboard;
