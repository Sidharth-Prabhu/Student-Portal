import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';
import { isChromeOrSafariAndNotWebView } from './DownloadAPK';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isStandalone] = useState(() => {
    if (typeof window === 'undefined') return false;
    const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean };
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      navigatorWithStandalone.standalone ||
      document.referrer.includes('android-app://')
    );
  });

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      
      const isApkEligible = isChromeOrSafariAndNotWebView() && localStorage.getItem('download-apk-dismissed') !== 'true';
      
      // Only show if not already installed/standalone and APK banner is not active/eligible
      if (!isStandalone && !isApkEligible) {
        // Show the popup after a short delay
        setTimeout(() => setShowPopup(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [isStandalone]);

  useEffect(() => {
    const checkAndShowPwa = () => {
      if (deferredPrompt && !isStandalone) {
        setTimeout(() => setShowPopup(true), 1500);
      }
    };

    window.addEventListener('download-apk-dismissed-event', checkAndShowPwa);
    return () => window.removeEventListener('download-apk-dismissed-event', checkAndShowPwa);
  }, [deferredPrompt, isStandalone]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    setShowPopup(false);
    // Show the prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
  };

  if (isStandalone || !showPopup) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-24 left-4 right-4 z-[100] sm:left-auto sm:right-6 sm:w-80"
      >
        <div className="bg-bg-card border border-accent-blue/30 rounded-3xl p-6 shadow-2xl shadow-accent-blue/20 backdrop-blur-xl">
          <button 
            onClick={() => setShowPopup(false)}
            className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={18} />
          </button>
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent-blue/10 flex items-center justify-center text-accent-blue shrink-0">
              <Smartphone size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm">Install Student Portal</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Add this to your home screen for a faster, full-screen experience.
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={handleInstall}
              className="w-full bg-accent-blue hover:bg-accent-blue/90 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 text-xs transition-all active:scale-[0.98]"
            >
              <Download size={16} />
              Install Now
            </button>
            <button
              onClick={() => setShowPopup(false)}
              className="w-full bg-bg-secondary text-text-secondary py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:text-text-primary transition-all"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InstallPWA;
