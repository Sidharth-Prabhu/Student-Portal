import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Calendar, Calculator, Clock, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import InstallPWA from './InstallPWA';
import DownloadAPK from './DownloadAPK';
import { ShyamEasterEgg } from './ShyamEasterEgg';

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
    { name: 'CAT', path: '/cat-schedule', icon: BookOpen },
    { name: 'Attendance', path: '/attendance', icon: Calendar },
    { name: 'Grades', path: '/cgpa', icon: Calculator },
  ];

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col md:flex-row font-sans selection:bg-accent-blue/30">
      <ShyamEasterEgg />
      
      {/* Desktop Sidebar Navigation */}
      {user && (
        <aside className="hidden md:flex flex-col w-64 bg-bg-card border-r border-border-color/10 p-6 h-screen sticky top-0 shrink-0 justify-between">
          <div className="space-y-8">
            {/* Logo */}
            <div className="flex items-center gap-3 px-2">
              <span className="text-xl font-black tracking-widest uppercase bg-clip-text bg-gradient-to-r from-accent-blue to-accent-purple text-transparent">
                Magister
              </span>
            </div>
            
            {/* Nav Links */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200",
                      isActive 
                        ? "text-accent-blue bg-accent-blue/10 border border-accent-blue/20" 
                        : "text-text-secondary hover:text-text-primary hover:bg-bg-secondary/40 border border-transparent"
                    )}
                  >
                    <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="pt-4 border-t border-border-color/5 space-y-1">
            <p className="text-[10px] text-text-secondary/70 font-medium leading-normal">
              © {new Date().getFullYear()} Magister by Frissco Digital Ventures.
            </p>
            <p className="text-[9px] text-text-secondary/40 font-mono tracking-wider uppercase">
              AI & DS • RIT
            </p>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className={cn(
        "flex-grow flex flex-col min-w-0",
        user ? "pb-24 md:pb-0" : "" // Add space for bottom nav on mobile only
      )}>
        <div className={cn(
          "px-4 py-6 flex-grow",
          user ? "container mx-auto max-w-lg md:max-w-5xl" : "container mx-auto max-w-lg"
        )}>
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

        {/* Mobile-only Footer */}
        <footer className="w-full py-8 mt-auto text-center space-y-2 border-t border-border-color/5 md:hidden">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs font-black tracking-widest uppercase bg-clip-text bg-gradient-to-r from-accent-blue to-accent-purple text-transparent">
              Magister
            </span>
          </div>
          <p className="text-[9px] text-text-secondary/70 font-medium tracking-wide">
            © {new Date().getFullYear()} Magister by Frissco Digital Ventures. All rights reserved.
          </p>
          <p className="text-[8px] text-text-secondary/40 font-mono tracking-widest uppercase">
            AI & DS Department • RIT
          </p>
        </footer>
      </main>

      {/* Bottom Navigation Bar */}
      {user && (
        <>
          <div className="md:hidden">
            <InstallPWA />
          </div>
          <nav className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto neu-flat rounded-2xl p-2.5 backdrop-blur-lg bg-bg-primary/95 md:hidden">
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
