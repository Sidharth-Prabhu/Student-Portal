import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, 
  Trash2, 
  PlusCircle, 
  Save, 
  GraduationCap,
  Award,
  BookOpen,
  Info
} from 'lucide-react';
import { semData, gradePoints } from '../data/semesters';
import { clsx } from 'clsx';

import { db } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

interface SavedSem {
  sem: string;
  gpa: number;
  credits: number;
  grades: Record<string, string>;
}

const CGPA: React.FC = () => {
  const { user } = useAuth();
  const [selectedSem, setSelectedSem] = useState('');
  const [grades, setGrades] = useState<Record<string, string>>({});
  const [currentGpa, setCurrentGpa] = useState<number | null>(null);
  const [savedSems, setSavedSems] = useState<SavedSem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const loadGrades = async () => {
      if (!user) return;
      
      // 1. Try LocalStorage first
      const saved = localStorage.getItem('cgpaData');
      if (saved) {
        setSavedSems(JSON.parse(saved));
      }

      // 2. Fetch from Firestore (New sub-collection structure)
      try {
        const docRef = doc(db, 'user_logs', user.reg, 'academic_records', 'current');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const cloudData = docSnap.data().semesters || [];
          setSavedSems(cloudData);
          localStorage.setItem('cgpaData', JSON.stringify(cloudData));
        }
      } catch (e) {
        console.error("Firestore load error", e);
      }
    };
    
    loadGrades();
  }, [user]);

  const saveToCloud = async (data: SavedSem[]) => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const totalPoints = data.reduce((sum, s) => sum + s.gpa * s.credits, 0);
      const totalCredits = data.reduce((sum, s) => sum + s.credits, 0);
      const cgpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';

      // Saving to sub-collection: user_logs/{reg}/academic_records/current
      await setDoc(doc(db, 'user_logs', user.reg, 'academic_records', 'current'), {
        cgpa: parseFloat(cgpa),
        semesters: data,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
      
      localStorage.setItem('cgpaData', JSON.stringify(data));
    } catch (e) {
      console.error("Firestore save error", e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGradeChange = (code: string, grade: string) => {
    setGrades(prev => ({ ...prev, [code]: grade }));
  };

  const calculateGpa = () => {
    if (!selectedSem) return;
    const subjects = semData[selectedSem].filter(s => s.credits > 0);
    
    let totalPoints = 0;
    let totalCredits = 0;
    let allFilled = true;

    subjects.forEach(sub => {
      const grade = grades[sub.code];
      if (!grade) {
        allFilled = false;
        return;
      }
      totalPoints += gradePoints[grade] * sub.credits;
      totalCredits += sub.credits;
    });

    if (!allFilled) {
      alert('Please select grades for all subjects.');
      return;
    }

    const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    setCurrentGpa(gpa);
  };

  const addToCgpa = async () => {
    if (currentGpa === null || !selectedSem) return;

    const subjects = semData[selectedSem].filter(s => s.credits > 0);
    const totalCredits = subjects.reduce((sum, sub) => sum + sub.credits, 0);

    let updated: SavedSem[];
    const existingIdx = savedSems.findIndex(s => s.sem === selectedSem);
    
    if (existingIdx !== -1) {
      updated = [...savedSems];
      updated[existingIdx] = { sem: selectedSem, gpa: currentGpa, credits: totalCredits, grades: { ...grades } };
    } else {
      updated = [...savedSems, { sem: selectedSem, gpa: currentGpa, credits: totalCredits, grades: { ...grades } }].sort((a,b) => parseInt(a.sem) - parseInt(b.sem));
    }
    
    setSavedSems(updated);
    await saveToCloud(updated);
  };

  const removeSem = async (sem: string) => {
    const updated = savedSems.filter(s => s.sem !== sem);
    setSavedSems(updated);
    await saveToCloud(updated);
  };

  const resetCgpa = async () => {
    if (confirm('Reset all CGPA data?')) {
      setSavedSems([]);
      await saveToCloud([]);
    }
  };

  const calculateOverallCgpa = () => {
    if (savedSems.length === 0) return '0.00';
    const totalPoints = savedSems.reduce((sum, s) => sum + s.gpa * s.credits, 0);
    const totalCredits = savedSems.reduce((sum, s) => sum + s.credits, 0);
    return (totalPoints / totalCredits).toFixed(2);
  };

  return (
    <div className="space-y-8 max-w-lg mx-auto pb-8">
      {/* GPA Banner */}
      <section className="bg-bg-card border border-border-color rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-accent-purple/10 blur-2xl rounded-full"></div>
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-[10px] uppercase font-bold text-text-secondary tracking-widest mb-1">Cumulative CGPA</p>
            <h1 className="text-4xl font-black text-white">{calculateOverallCgpa()}</h1>
          </div>
          <div className="w-14 h-14 bg-accent-purple/10 rounded-2xl flex items-center justify-center text-accent-purple">
            <Award size={28} />
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section className="space-y-4">
        <div className="bg-bg-card border border-border-color rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <PlusCircle size={20} className="text-accent-blue" />
            <h2 className="text-xs font-bold uppercase tracking-widest">GPA Calculator</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-text-secondary ml-2 tracking-widest">Select Semester</label>
              <select
                value={selectedSem}
                onChange={(e) => {
                  const sem = e.target.value;
                  setSelectedSem(sem);
                  const existing = savedSems.find(s => s.sem === sem);
                  if (existing && existing.grades) {
                    setGrades(existing.grades);
                    setCurrentGpa(existing.gpa);
                  } else {
                    setGrades({});
                    setCurrentGpa(null);
                  }
                }}
                className="w-full bg-bg-secondary border border-border-color rounded-2xl py-3 px-4 focus:outline-none focus:border-accent-blue transition-all text-sm font-bold"
              >
                <option value="">-- Choose --</option>
                {Object.keys(semData).map(num => (
                  <option key={num} value={num}>Semester {num}</option>
                ))}
              </select>
            </div>

            <AnimatePresence mode="wait">
              {selectedSem ? (
                <motion.div
                  key={selectedSem}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="space-y-3">
                    {semData[selectedSem].filter(s => s.credits > 0).map((sub) => (
                      <div key={sub.code} className="p-4 bg-bg-secondary/50 border border-border-color rounded-2xl flex items-center justify-between gap-4">
                        <div className="flex-grow">
                          <p className="text-xs font-bold leading-tight">{sub.name}</p>
                          <p className="text-[9px] text-text-secondary uppercase font-bold mt-1 tracking-tighter">{sub.code} • {sub.credits} Credits</p>
                        </div>
                        <select
                          value={grades[sub.code] || ''}
                          onChange={(e) => handleGradeChange(sub.code, e.target.value)}
                          className="w-16 bg-bg-card border border-border-color rounded-xl py-1 px-1 text-xs font-bold text-center focus:outline-none focus:border-accent-blue"
                        >
                          <option value="">--</option>
                          {Object.keys(gradePoints).filter(g => g !== "").map(g => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>

                  {currentGpa !== null && (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-4 bg-accent-blue/10 border border-accent-blue/30 rounded-2xl text-center"
                    >
                      <p className="text-[10px] uppercase font-bold text-accent-blue tracking-widest">Calculated GPA</p>
                      <p className="text-2xl font-black text-accent-blue">{currentGpa.toFixed(2)}</p>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <button
                      onClick={calculateGpa}
                      className="py-3.5 bg-bg-secondary border border-border-color rounded-2xl font-bold text-xs hover:border-accent-blue transition-all active:scale-95"
                    >
                      Calculate
                    </button>
                    <button
                      onClick={addToCgpa}
                      disabled={currentGpa === null || isSyncing}
                      className="py-3.5 bg-gradient-to-r from-accent-blue to-accent-purple text-white rounded-2xl font-bold text-xs shadow-lg disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      {isSyncing && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                      {isSyncing ? 'Saving...' : 'Save to CGPA'}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="py-8 text-center opacity-40">
                  <BookOpen size={32} className="mx-auto mb-2" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Select a semester</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Summary List */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-text-secondary">Academic History</h2>
          {savedSems.length > 0 && (
            <button onClick={resetCgpa} className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Reset</button>
          )}
        </div>

        {savedSems.length > 0 ? (
          <div className="space-y-2">
            {savedSems.map((s) => (
              <div key={s.sem} className="flex items-center justify-between p-4 bg-bg-card border border-border-color rounded-2xl shadow-sm">
                <div>
                  <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">Semester {s.sem}</p>
                  <p className="text-lg font-bold">{s.gpa.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => removeSem(s.sem)}
                  className="p-2 text-text-secondary hover:text-red-400 active:scale-90 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-bg-secondary/10 rounded-3xl border border-dashed border-border-color">
            <GraduationCap className="mx-auto text-text-secondary opacity-10 mb-2" size={32} />
            <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">No records saved</p>
          </div>
        )}
      </section>

      {/* Info Card */}
      <div className="bg-bg-secondary/30 rounded-2xl p-4 flex items-start gap-3 border border-border-color/20">
        <Info size={16} className="text-accent-purple shrink-0 mt-0.5" />
        <p className="text-[10px] text-text-secondary leading-normal font-medium italic">
          Based on Anna University R2023 regulations. CGPA is weighted by subject credits.
        </p>
      </div>
    </div>
  );
};

export default CGPA;
