import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import Timetable from './pages/Timetable';
import Attendance from './pages/Attendance';
import CGPA from './pages/CGPA';
import ExamTimetable from './pages/ExamTimetable';
import CatSchedule from './pages/CatSchedule';
import MarkAttendance from './pages/MarkAttendance';
import ViewAttendance from './pages/ViewAttendance';
import Summary from './pages/Summary';
import DatabaseManager from './pages/DatabaseManager';
import StudentDetails from './pages/StudentDetails';
import DevConsole from './pages/DevConsole';
import FacultyDashboard from './pages/FacultyDashboard';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin"></div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, isLoading } = useAuth();
  
  if (isLoading) return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin"></div>
    </div>
  );
  
  if (!isAdmin) return <Navigate to="/admin-login" replace />;
  
  return <>{children}</>;
};

const DevRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDev, isLoading } = useAuth();
  
  if (isLoading) return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
    </div>
  );
  
  if (!isDev) return <Navigate to="/" replace />;
  
  return <>{children}</>;
};

const FacultyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isFaculty, isLoading } = useAuth();
  
  if (isLoading) return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
    </div>
  );
  
  if (!isFaculty) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
};

import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/timetable" element={<ProtectedRoute><Timetable /></ProtectedRoute>} />
            <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
            <Route path="/cgpa" element={<ProtectedRoute><CGPA /></ProtectedRoute>} />
            <Route path="/exam-timetable" element={<ProtectedRoute><ExamTimetable /></ProtectedRoute>} />
            <Route path="/cat-schedule" element={<ProtectedRoute><CatSchedule /></ProtectedRoute>} />
            <Route path="/student/:id" element={<ProtectedRoute><StudentDetails /></ProtectedRoute>} />

            {/* Admin Only Features */}
            <Route path="/mark-attendance" element={<AdminRoute><MarkAttendance /></AdminRoute>} />
            <Route path="/view-attendance" element={<AdminRoute><ViewAttendance /></AdminRoute>} />
            <Route path="/summary" element={<AdminRoute><Summary /></AdminRoute>} />
            <Route path="/database-manager" element={<AdminRoute><DatabaseManager /></AdminRoute>} />

            {/* Faculty Features */}
            <Route path="/faculty" element={<FacultyRoute><FacultyDashboard /></FacultyRoute>} />

            {/* Dev Only Features */}
            <Route path="/dev-console" element={<DevRoute><DevConsole /></DevRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
