import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Calendar, Calculator, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import InstallPWA from './InstallPWA';
import DownloadAPK from './DownloadAPK';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Layout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

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
      {/* Main Content Area */}
      <main className={cn(
        "flex-grow flex flex-col",
        user ? "pb-24" : "" // Add space for bottom nav
      )}>
        <div className="container mx-auto max-w-lg px-4 py-4 flex-grow">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
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
          <nav className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto neu-flat rounded-2xl p-2.5 backdrop-blur-lg bg-bg-primary/95">
            <div className="flex items-center justify-around h-12">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="relative flex flex-col items-center justify-center w-16 group animate-none"
                  >
                    <div className={cn(
                      "p-1.5 px-4 rounded-full transition-all duration-300 flex items-center justify-center",
                      isActive 
                        ? "text-accent-blue bg-accent-blue/15 scale-105" 
                        : "text-text-secondary hover:text-text-primary"
                    )}>
                      <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    <span className={cn(
                      "text-[8px] font-extrabold mt-1 tracking-wider transition-all duration-300",
                      isActive ? "opacity-100 text-accent-blue" : "opacity-60 text-text-secondary"
                    )}>
                      {item.name}
                    </span>
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
