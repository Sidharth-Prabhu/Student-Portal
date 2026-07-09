import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
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
  User,
  Bell,
  LogOut,
  Sun,
  Moon
} from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
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
    color: 'bg-emerald-500/10 rounded-full',
    iconColor: 'text-emerald-600 dark:text-emerald-400'
  },
  {
    title: 'Daily Timetable',
    path: '/timetable',
    icon: Clock,
    color: 'bg-accent-blue/10 rounded-full',
    iconColor: 'text-accent-blue'
  },
  {
    title: 'Grades Calc',
    path: '/cgpa',
    icon: Calculator,
    color: 'bg-accent-purple/10 rounded-full',
    iconColor: 'text-accent-purple'
  }
];

const Dashboard: React.FC = () => {
  const { user, isAdmin, isDev, isEligibleForAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [displayCgpa, setDisplayCgpa] = useState<string | null>(null);
  const [isLoadingCgpa, setIsLoadingCgpa] = useState(true);
  const [attendanceStatus, setAttendanceStatus] = useState<{ label: string, color: string } | null>(null);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(true);

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

  const handleLogout = () => {
    if (confirm('Are you sure you want to sign out?')) {
      logout();
      navigate('/login');
    }
  };

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
          const snap = await getDocs(collection(db, 'attendance'));
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
    <div className="space-y-6 max-w-lg mx-auto pb-8">
      {/* Student Profile Greeting & Actions Header */}
      <section className="flex items-center justify-between px-2 pt-2 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-full neu-inset flex items-center justify-center shrink-0 border border-border-color/10">
            <User className="text-accent-blue" size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] text-text-secondary uppercase tracking-widest font-black leading-none">Welcome Back</p>
            <h1 className="text-base font-black text-text-primary leading-tight mt-1.5 truncate">{user?.name.split(' ')[0]}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 neu-btn text-text-secondary hover:text-text-primary flex items-center justify-center cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <motion.div
              key={theme}
              initial={{ rotate: -90, scale: 0.8, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {theme === 'dark' ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} className="text-accent-purple" />}
            </motion.div>
          </button>

          {/* Notifications */}
          <button className="p-2.5 neu-btn text-text-secondary hover:text-text-primary relative flex items-center justify-center cursor-pointer">
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-bg-primary"></span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2.5 neu-btn text-text-secondary hover:text-red-500 flex items-center justify-center cursor-pointer"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </section>

      {/* Welcome Banner / Academic Details */}
      <section className="relative overflow-hidden rounded-3xl neu-flat p-6 border border-border-color/10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/5 blur-3xl rounded-full"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-[9px] uppercase font-bold tracking-wider text-text-secondary">Official Credentials</p>
            <h2 className="text-base font-bold text-text-primary mt-1.5">
              AI & DS • Semester 05 • Section E
            </h2>
            <p className="text-[10px] text-text-secondary/80 mt-1 font-mono">{user?.regNum}</p>
          </div>
          {isAdmin && (
            <div className="w-10 h-10 rounded-xl neu-inset flex items-center justify-center text-orange-500 shrink-0">
              <ShieldCheck size={20} />
            </div>
          )}
        </div>
      </section>

      {/* Quick Stats Grid */}
      <section className="grid grid-cols-2 gap-4">
        <Link to="/attendance" className="neu-flat-hover p-4 rounded-2xl flex flex-col gap-3 block text-left">
          <div className="w-8 h-8 rounded-lg neu-inset flex items-center justify-center text-emerald-400">
            <TrendingUp size={16} />
          </div>
          <div>
            <p className="text-[9px] uppercase font-bold text-text-secondary tracking-widest font-mono text-left">Attendance</p>
            {isLoadingAttendance ? (
              <div className="h-6 w-16 bg-bg-secondary animate-pulse rounded mt-1"></div>
            ) : (
              <p className={clsx("text-lg font-bold mt-1", attendanceStatus?.color)}>{attendanceStatus?.label}</p>
            )}
          </div>
        </Link>

        {isLoadingCgpa ? (
          <div className="neu-flat p-4 rounded-2xl flex flex-col gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-lg bg-bg-secondary"></div>
            <div className="h-2 w-12 bg-bg-secondary rounded"></div>
            <div className="h-4 w-16 bg-bg-secondary rounded"></div>
          </div>
        ) : (
          <Link to="/cgpa" className="neu-flat-hover p-4 rounded-2xl flex flex-col gap-3 block text-left">
            <div className="w-8 h-8 rounded-lg neu-inset flex items-center justify-center text-accent-purple">
              <Award size={16} />
            </div>
            <div>
              <p className="text-[9px] uppercase font-bold text-text-secondary tracking-widest font-mono text-left">Current CGPA</p>
              <p className={clsx("font-bold text-text-primary mt-1", displayCgpa ? "text-lg" : "text-xs")}>
                {displayCgpa || 'Calculate Now!'}
              </p>
            </div>
          </Link>
        )}
      </section>

      {/* Quick Navigation Cards */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-text-secondary px-2">Quick Navigation</h2>
        <div className="grid grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="neu-flat-hover p-4 rounded-2xl flex flex-col items-center gap-3 block"
            >
              <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center", link.color)}>
                <link.icon size={18} className={link.iconColor} />
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
            <h2 className="text-xs font-bold uppercase tracking-widest text-text-secondary">
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
                  className="h-full"
                >
                  <Link
                    to={action.path}
                    className="flex flex-col gap-4 p-5 neu-flat-hover rounded-3xl h-full text-left"
                  >
                    <div className="w-12 h-12 rounded-2xl neu-inset flex items-center justify-center shrink-0">
                      <action.icon size={22} className={action.iconColor} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm leading-tight text-text-primary">{action.title}</h3>
                      <p className="text-[10px] text-text-secondary mt-1">{action.desc}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <Link
              to="/admin-login"
              className="flex items-center justify-between p-6 neu-flat-hover rounded-3xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl neu-inset flex items-center justify-center text-text-secondary">
                  <Lock size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-text-primary">Login as Administrator</h3>
                  <p className="text-[10px] text-text-secondary mt-1">Unlock attendance marking and database tools</p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full neu-btn flex items-center justify-center text-text-secondary">
                <ArrowRight size={18} />
              </div>
            </Link>
          )}
        </section>
      )}
    </div>
  );
};

export default Dashboard;
