import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Timetable from './pages/Timetable';
import Attendance from './pages/Attendance';
import CGPA from './pages/CGPA';
import ExamTimetable from './pages/ExamTimetable';

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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/timetable" element={<ProtectedRoute><Timetable /></ProtectedRoute>} />
            <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
            <Route path="/cgpa" element={<ProtectedRoute><CGPA /></ProtectedRoute>} />
            <Route path="/exam-timetable" element={<ProtectedRoute><ExamTimetable /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
