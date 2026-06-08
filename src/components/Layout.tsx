import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, Calendar, Calculator, Clock, User, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import InstallPWA from './InstallPWA';
import DownloadAPK from './DownloadAPK';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (confirm('Are you sure you want to sign out?')) {
      logout();
      navigate('/login');
    }
  };

  if (!user && location.pathname !== '/login') {
    return <Outlet />;
  }

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Schedule', path: '/timetable', icon: Clock },
    { name: 'Attendance', path: '/attendance', icon: Calendar },
    { name: 'Grades', path: '/cgpa', icon: Calculator },
  ];

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col font-sans selection:bg-accent-blue/30">
      {/* Mobile Top Header */}
      {user && (
        <header className="sticky top-0 z-40 bg-bg-primary/80 backdrop-blur-xl border-b border-border-color/50 px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent-blue to-accent-purple p-[2px]">
              <div className="w-full h-full rounded-full bg-bg-card flex items-center justify-center overflow-hidden">
                <User size={20} className="text-accent-blue" />
              </div>
            </div>
            <div>
              <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Student</p>
              <p className="text-sm font-bold truncate max-w-[120px]">{user.name.split(' ')[0]}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 text-text-secondary hover:text-text-primary transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-bg-primary"></span>
            </button>
            <button 
              onClick={handleLogout}
              className="p-2 text-text-secondary hover:text-red-400 transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className={cn(
        "flex-grow flex flex-col",
        user ? "pb-24" : "" // Add space for bottom nav
      )}>
        <div className="container mx-auto max-w-lg px-6 py-6 flex-grow">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      {user && (
        <>
          <InstallPWA />
          <nav className="fixed bottom-0 left-0 right-0 z-50 bg-bg-card/80 backdrop-blur-2xl border-t border-border-color/50 px-4 pb-safe-area-inset-bottom">
          <div className="max-w-lg mx-auto flex items-center justify-around h-20">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative flex flex-col items-center justify-center w-16 group"
                >
                  <div className={cn(
                    "p-2 rounded-2xl transition-all duration-300",
                    isActive ? "text-accent-blue scale-110" : "text-text-secondary group-hover:text-text-primary"
                  )}>
                    <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold transition-all duration-300",
                    isActive ? "opacity-100 translate-y-0 text-accent-blue" : "opacity-60 translate-y-1 text-text-secondary"
                  )}>
                    {item.name}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -top-1 w-1 h-1 bg-accent-blue rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
        </>
      )}

      {/* Dynamic Download Android App Banner */}
      <DownloadAPK isLoggedIn={!!user} />
    </div>
  );
};

export default Layout;
