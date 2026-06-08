import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, AlertCircle } from 'lucide-react';

// Robust browser detection: Chrome or Safari, but not Android WebView
export const isChromeOrSafariAndNotWebView = (): boolean => {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent.toLowerCase();
  
  // 1. Android WebView check
  // - Typically contains '; wv)' or ' wv' or 'version/4.0' or 'webview'
  // - document.referrer contains 'android-app://'
  const isAndroidWebView = 
    ua.includes('wv') || 
    ua.includes('webview') || 
    (ua.includes('android') && ua.includes('version/')) ||
    document.referrer.includes('android-app://');
    
  if (isAndroidWebView) return false;
  
  // 2. Chrome check (Desktop, Mobile, iOS CriOS)
  const isChrome = (ua.includes('chrome') || ua.includes('crios')) && 
                    !ua.includes('edg') && 
                    !ua.includes('opr') && 
                    !ua.includes('brave') && 
                    !ua.includes('focus') && 
                    !ua.includes('firefox') && 
                    !ua.includes('fxios');
                    
  // 3. Safari check (Desktop, iOS Safari)
  const isSafari = ua.includes('safari') && 
                    !ua.includes('chrome') && 
                    !ua.includes('crios') && 
                    !ua.includes('android') && 
                    !ua.includes('edg') && 
                    !ua.includes('firefox') && 
                    !ua.includes('fxios') && 
                    !ua.includes('opr');
                    
  return isChrome || isSafari;
};

const AndroidIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v6c0 .83.67 1.5 1.5 1.5S5 16.33 5 15.5v-6C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v6c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-6c0-.83-.67-1.5-1.5-1.5zm-4.72-4.18l1.22-1.22a.495.495 0 0 0 0-.7c-.19-.19-.51-.19-.7 0L15 3.1c-.9-.39-1.91-.6-3-.6s-2.1.21-3 .6L7.78 1.9c-.19-.19-.51-.19-.7 0a.495.495 0 0 0 0 .7l1.22 1.22C6.58 5.17 5 7.39 5 10h14c0-2.61-1.58-4.83-3.22-6.18zM9 7.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
  </svg>
);

interface DownloadAPKProps {
  isLoggedIn?: boolean;
}

export const triggerAPKDownload = async (
  setIsDownloading?: (loading: boolean) => void,
  setShowErrorAlert?: (error: boolean) => void
) => {
  if (setIsDownloading) setIsDownloading(true);
  if (setShowErrorAlert) setShowErrorAlert(false);

  const fallbackUrl = 'https://github.com/Sidharth-Prabhu/Student-Portal/releases/download/V1.0/app-release.apk';
  const latestRedirectUrl = 'https://github.com/Sidharth-Prabhu/Student-Portal/releases/latest/download/app-release.apk';

  try {
    // 1. Attempt to fetch latest release from GitHub API
    const response = await fetch('https://api.github.com/repos/Sidharth-Prabhu/Student-Portal/releases/latest', {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      const apkAsset = data.assets?.find((asset: any) => asset.name.endsWith('.apk'));

      if (apkAsset && apkAsset.browser_download_url) {
        window.location.href = apkAsset.browser_download_url;
        if (setIsDownloading) setIsDownloading(false);
        return;
      }
    }

    // 2. If API fails (e.g., private repo, rate limits), try the direct GitHub releases redirect
    console.warn('GitHub API not accessible or no APK asset found. Redirecting to latest release download path...');
    window.location.href = latestRedirectUrl;

  } catch (error) {
    console.error('Error fetching latest release metadata:', error);
    // 3. Absolute fallback to hardcoded V1.0 APK
    window.location.href = fallbackUrl;
    if (setShowErrorAlert) setShowErrorAlert(true);
  } finally {
    // Keep loading spinner briefly to give visual feedback before redirect complete
    if (setIsDownloading) {
      setTimeout(() => setIsDownloading(false), 1500);
    }
  }
};

const DownloadAPK: React.FC<DownloadAPKProps> = ({ isLoggedIn = false }) => {
  const [showBanner, setShowBanner] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  useEffect(() => {
    const isEligible = isChromeOrSafariAndNotWebView();
    const isDismissed = localStorage.getItem('download-apk-dismissed') === 'true';

    if (isEligible && !isDismissed) {
      // Show the banner after a short delay for smooth loading entrance
      const timer = setTimeout(() => setShowBanner(true), 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('download-apk-dismissed', 'true');
    // Dispatch a custom event to notify InstallPWA that the APK banner is dismissed
    window.dispatchEvent(new Event('download-apk-dismissed-event'));
  };

  const handleDownload = () => {
    triggerAPKDownload(setIsDownloading, setShowErrorAlert);
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className={`fixed ${isLoggedIn ? 'bottom-24' : 'bottom-6'} left-4 right-4 z-[100] sm:left-auto sm:right-6 sm:w-80`}
      >
        <div className="bg-bg-card border border-emerald-500/30 rounded-3xl p-6 shadow-2xl shadow-emerald-950/30 backdrop-blur-xl relative">
          <button 
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Dismiss APK download suggestion"
          >
            <X size={18} />
          </button>
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
              <AndroidIcon className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm">Download Android App</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Install the official Android app (.APK) for the fastest and most stable mobile experience.
              </p>
            </div>
          </div>
          
          {showErrorAlert && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-[10px] text-red-400 font-medium leading-normal animate-pulse">
              <AlertCircle size={14} className="shrink-0" />
              <span>Direct fetch failed. Initiating standard V1.0 fallback download...</span>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-600/70 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 text-xs transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20"
            >
              {isDownloading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Download size={16} />
              )}
              {isDownloading ? 'Fetching Latest APK...' : 'Download APK'}
            </button>
            <button
              onClick={handleDismiss}
              className="w-full bg-bg-secondary text-text-secondary py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:text-text-primary transition-all"
            >
              Maybe Later
            </button>
          </div>
          
          {/* Subtle note about fallback just in case */}
          <div className="mt-3 text-center">
            <a 
              href="https://github.com/Sidharth-Prabhu/Student-Portal/releases/download/V1.0/app-release.apk"
              className="text-[9px] text-text-secondary hover:text-emerald-400 transition-colors underline"
            >
              Having issues? Click here for the direct V1.0 link
            </a>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DownloadAPK;
