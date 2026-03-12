import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Calendar, Calculator, ArrowRight, TrendingUp, Award } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { clsx } from 'clsx';

const tools = [
  {
    title: 'Timetable',
    desc: 'Live period tracking',
    icon: Clock,
    path: '/timetable',
    color: 'from-blue-500 to-indigo-600',
    iconColor: 'text-blue-400'
  },
  {
    title: 'Attendance',
    desc: 'Track your presence',
    icon: Calendar,
    path: '/attendance',
    color: 'from-emerald-500 to-teal-600',
    iconColor: 'text-emerald-400'
  },
  {
    title: 'CGPA',
    desc: 'Calculate & save grades',
    icon: Calculator,
    path: '/cgpa',
    color: 'from-purple-500 to-pink-600',
    iconColor: 'text-purple-400'
  }
];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [displayCgpa, setDisplayCgpa] = useState<string | null>(null);
  const [isLoadingCgpa, setIsLoadingCgpa] = useState(true);
  const [attendanceStatus, setAttendanceStatus] = useState<{ label: string, color: string } | null>(null);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      // 1. Fetch CGPA
      const fetchCgpa = async () => {
        // Try local cache first
        const saved = localStorage.getItem('cgpaData');
        if (saved) {
          try {
            const data = JSON.parse(saved);
            if (data.length > 0) {
              const totalPoints = data.reduce((sum: number, s: any) => sum + s.gpa * s.credits, 0);
              const totalCredits = data.reduce((sum: number, s: any) => sum + s.credits, 0);
              if (totalCredits > 0) {
                setDisplayCgpa((totalPoints / totalCredits).toFixed(2));
              }
            }
          } catch (e) {}
        }

        try {
          const docRef = doc(db, 'user_logs', user.reg, 'academic_records', 'current');
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

      // 2. Fetch Attendance Status
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
            if (data.absents?.includes(user.reg)) {
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
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Hi, <span className="gradient-text">{user?.name.split(' ')[0]}</span>
          </h1>
          <p className="text-text-secondary mt-2 text-sm">
            AI & DS • Semester 04 • Section E
          </p>
        </div>
      </section>

      {/* Quick Stats Grid */}
      <section className="grid grid-cols-2 gap-4">
        <Link to="/attendance" className="bg-bg-card border border-border-color p-4 rounded-2xl flex flex-col gap-2 shadow-sm active:scale-95 transition-transform block">
          <div className="w-8 h-8 rounded-lg bg-emerald-400/10 flex items-center justify-center text-emerald-400">
            <TrendingUp size={18} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-text-secondary tracking-widest font-mono">Attendance</p>
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
        ) : displayCgpa ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Link to="/cgpa" className="bg-bg-card border border-border-color p-4 rounded-2xl flex flex-col gap-2 shadow-sm active:scale-95 transition-transform h-full block">
              <div className="w-8 h-8 rounded-lg bg-accent-purple/10 flex items-center justify-center text-accent-purple">
                <Award size={18} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-text-secondary tracking-widest font-mono">Current CGPA</p>
                <p className="text-xl font-bold text-white">{displayCgpa}</p>
              </div>
            </Link>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Link to="/cgpa" className="bg-bg-card border border-accent-purple/30 p-4 rounded-2xl flex flex-col gap-2 shadow-sm active:scale-95 transition-all group h-full block text-left">
              <div className="w-8 h-8 rounded-lg bg-accent-purple/10 flex items-center justify-center text-accent-purple group-hover:bg-accent-purple group-hover:text-white transition-colors text-left">
                <Calculator size={18} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-text-secondary tracking-widest font-mono">Grades</p>
                <p className="text-[10px] font-bold text-accent-purple leading-tight">Setup Monitor</p>
              </div>
            </Link>
          </motion.div>
        )}
      </section>

      {/* Tools List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-sm font-bold uppercase tracking-widest text-text-secondary">Academic Tools</h2>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {tools.map((tool, idx) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link
                to={tool.path}
                className="flex items-center gap-4 p-4 bg-bg-card border border-border-color rounded-2xl group hover:border-accent-blue/50 transition-all active:scale-[0.98]"
              >
                <div className={`w-12 h-12 rounded-xl bg-bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <tool.icon size={24} className={tool.iconColor} />
                </div>
                <div className="flex-grow">
                  <h3 className="font-bold text-sm">{tool.title}</h3>
                  <p className="text-xs text-text-secondary">{tool.desc}</p>
                </div>
                <div className="text-text-secondary group-hover:text-accent-blue transition-colors">
                  <ArrowRight size={18} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
