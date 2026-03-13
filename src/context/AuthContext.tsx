import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Student } from '../data/students';
import { students } from '../data/students';
import { auth, db } from '../lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut,
  type User
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: Student | null;
  isAdmin: boolean;
  isDev: boolean;
  isEligibleForAdmin: boolean;
  firebaseUser: User | null;
  login: (regNum: string) => Promise<void>;
  adminLogin: (regNum: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Student | null>(() => {
    const saved = localStorage.getItem('student_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEligibleForAdmin, setIsEligibleForAdmin] = useState(false);

  const checkEligibility = useCallback(async (regNum: string) => {
    if (regNum === '2117240070308') {
      await Promise.resolve(); // Ensure async to avoid sync state update in effect
      setIsEligibleForAdmin(true);
      return;
    }
    try {
      const docRef = doc(db, 'authorized_admins', regNum);
      const docSnap = await getDoc(docRef);
      setIsEligibleForAdmin(docSnap.exists());
    } catch (e) {
      console.error("Eligibility check failed", e);
      setIsEligibleForAdmin(false);
    }
  }, []);

  const logVisit = useCallback(async (student: Student, isLogin: boolean) => {
    try {
      const docRef = doc(db, "user_logs", student.regNum);
      await setDoc(docRef, {
        name: student.name,
        reg: student.regNum,
        lastTimestamp: serverTimestamp(),
        lastAction: isLogin ? "login_react" : "page_open_react",
        lastDate: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      }, { merge: true });
    } catch (err) {
      console.error("Firestore operation failed:", err);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user?.regNum) {
      checkEligibility(user.regNum);
    } else {
      setIsEligibleForAdmin(false);
    }
  }, [user?.regNum, checkEligibility]);

  const login = async (regNum: string) => {
    const student = students.find(s => s.regNum === regNum);
    if (!student) {
      throw new Error("Student not found with this register number");
    }
    setUser(student);
    localStorage.setItem('student_session', JSON.stringify(student));
    await logVisit(student, true);
  };

  const adminLogin = async (regNum: string, password: string) => {
    const student = students.find(s => s.regNum === regNum);
    if (!student) {
      throw new Error("Student not found");
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, student.email, password);
      setFirebaseUser(userCredential.user);
      if (!user) {
        setUser(student);
        localStorage.setItem('student_session', JSON.stringify(student));
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Admin login failed";
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
    localStorage.removeItem('student_session');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAdmin: !!firebaseUser, 
      isDev: !!firebaseUser && user?.regNum === '2117240070308',
      isEligibleForAdmin,
      firebaseUser, 
      login, 
      adminLogin, 
      logout, 
      isLoading 
    }}>
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
