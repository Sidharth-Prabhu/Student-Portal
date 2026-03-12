import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Student } from '../data/students';
import { students } from '../data/students';
import { db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: Student | null;
  login: (reg: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('portalUser');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        const found = students.find(s => s.reg === parsed.reg);
        if (found) {
          setUser(found);
          logVisit(found, false);
        }
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
    setIsLoading(false);
  }, []);

  const logVisit = async (student: Student, isLogin: boolean) => {
    try {
      const docRef = doc(db, "user_logs", student.reg);
      await setDoc(docRef, {
        name: student.name,
        reg: student.reg,
        lastTimestamp: serverTimestamp(),
        lastAction: isLogin ? "login_react" : "page_open_react",
        lastDate: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      }, { merge: true });
    } catch (err) {
      console.error("Firestore operation failed:", err);
    }
  };

  const login = (reg: string) => {
    const student = students.find(s => s.reg === reg);
    if (student) {
      setUser(student);
      localStorage.setItem('portalUser', JSON.stringify(student));
      logVisit(student, true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('portalUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
