import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Moon, Volume2, VolumeX, Sparkles, X } from 'lucide-react';
import video1 from '../assets/video_1.mp4';

const TARGET_ROLL_NUMBERS = [
  '2117240070308',
  '2117240070291',
  '2117240070306',
  '2117240070256',
  '2117240070293',
  '2117240070305'
];

export const ShyamEasterEgg: React.FC = () => {
  const { user } = useAuth();
  const [shouldShow, setShouldShow] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (user && TARGET_ROLL_NUMBERS.includes(user.regNum)) {
      const alreadyShown = sessionStorage.getItem('shyam_easter_egg_shown');
      if (!alreadyShown) {
        setShouldShow(true);
      }
    }
  }, [user]);

  // Handle play status change
  useEffect(() => {
    if (isPlaying && videoRef.current) {
      videoRef.current.play().catch(err => {
        console.error("Video playback failed:", err);
      });
    }
  }, [isPlaying]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, []);

  if (!shouldShow) return null;

  const startEasterEgg = () => {
    setIsPlaying(true);
  };

  const handleDismiss = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setShouldShow(false);
    sessionStorage.setItem('shyam_easter_egg_shown', 'true');
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuteState = !isMuted;
      videoRef.current.muted = newMuteState;
      setIsMuted(newMuteState);
    } else {
      setIsMuted(!isMuted);
    }
  };

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-zinc-950/98 overflow-hidden select-none"
        >
          {/* Islamic Geometric and Glowing Background */}
          {isPlaying && (
            <motion.div
              animate={{
                background: [
                  'radial-gradient(circle, rgba(16,185,129,0.2) 0%, rgba(9,9,11,1) 80%)',
                  'radial-gradient(circle, rgba(245,158,11,0.15) 0%, rgba(9,9,11,1) 80%)',
                  'radial-gradient(circle, rgba(4,120,87,0.25) 0%, rgba(9,9,11,1) 80%)',
                  'radial-gradient(circle, rgba(16,185,129,0.2) 0%, rgba(9,9,11,1) 80%)',
                ]
              }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              className="absolute inset-0 z-0 pointer-events-none"
            />
          )}

          {/* Starry overlays */}
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-10 opacity-70" />

          {/* Stage 1: The Warning Trigger */}
          {!isPlaying ? (
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="relative z-20 w-full max-w-md p-8 m-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.15)] text-center text-white backdrop-blur-md"
            >
              <div className="flex justify-center mb-6">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                  className="p-4 bg-emerald-500/10 rounded-full border border-emerald-500/30 text-emerald-400"
                >
                  <Moon size={48} className="fill-emerald-400/20" />
                </motion.div>
              </div>

              <h2 className="text-2xl font-black tracking-widest text-emerald-400 uppercase mb-3 font-mono">
                Divine Energy Detected
              </h2>
              <p className="text-zinc-300 text-sm font-mono leading-relaxed mb-6">
                A critical concentration of <span className="text-amber-400 font-bold">SUNATH ENERGY</span> is radiating from this registration number.
                Spiritual alignment is highly recommended to proceed.
              </p>

              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={startEasterEgg}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-amber-600 hover:from-emerald-500 hover:to-amber-500 text-white font-bold tracking-wider font-mono shadow-[0_4px_20px_rgba(16,185,129,0.3)] border border-emerald-400/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles size={18} className="text-amber-300 animate-spin" />
                  RESOLVE ALIGNMENT
                </motion.button>

                <button
                  onClick={handleDismiss}
                  className="w-full py-3 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 text-sm font-medium font-mono border border-zinc-800 cursor-pointer transition-colors"
                >
                  Bypass and proceed
                </button>
              </div>
            </motion.div>
          ) : (
            /* Stage 2: Playing Video Stage */
            <div className="relative z-20 w-full h-full flex flex-col items-center justify-between p-6">
              {/* Dynamic Header */}
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center mt-8 space-y-2"
              >
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-emerald-400 to-amber-300 animate-pulse font-mono uppercase select-none drop-shadow-[0_2px_8px_rgba(16,185,129,0.3)]">
                  You got Sunath Khan-rolled!
                </h1>
                <p className="text-zinc-400 font-mono text-sm tracking-widest flex items-center justify-center gap-2">
                  <Moon size={16} className="text-emerald-400 fill-emerald-400/20" />
                  Halal Content Playing • Infinite loop enabled
                  <Moon size={16} className="text-emerald-400 fill-emerald-400/20" />
                </p>
              </motion.div>

              {/* Central Video Container */}
              <div className="flex-grow flex items-center justify-center relative w-full max-w-xl px-4">
                {/* Background glow behind video */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.5, 0.2]
                  }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="absolute w-80 h-80 rounded-full bg-emerald-500 blur-3xl opacity-30"
                />

                <motion.div
                  initial={{ scale: 0.8, rotate: -5 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  className="relative z-30 w-full"
                >
                  <video
                    ref={videoRef}
                    src={video1}
                    autoPlay
                    loop
                    playsInline
                    muted={isMuted}
                    className="w-full max-w-[280px] md:max-w-[320px] aspect-[9/16] object-cover mx-auto rounded-2xl border-4 border-emerald-500/80 shadow-[0_0_50px_rgba(16,185,129,0.4)] bg-black"
                  />

                  {/* Decorative Islamic badges */}
                  <motion.div
                    animate={{ scale: [0.95, 1.05, 0.95] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="absolute -top-4 -right-4 bg-emerald-700 text-emerald-100 font-mono text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-emerald-500 rotate-6"
                  >
                    100% Halal
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1.05, 0.95, 1.05] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                    className="absolute -bottom-4 -left-4 bg-amber-700 text-amber-100 font-mono text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-amber-500 -rotate-6"
                  >
                    Sunath Khan
                  </motion.div>
                </motion.div>
              </div>

              {/* Bottom Controls */}
              <div className="w-full max-w-sm mb-8 space-y-4">
                <div className="flex gap-4">
                  {/* Mute Button */}
                  <button
                    onClick={toggleMute}
                    className="flex-1 py-3 px-4 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 font-mono text-sm border border-zinc-800 cursor-pointer flex items-center justify-center gap-2 transition-all"
                  >
                    {isMuted ? (
                      <>
                        <VolumeX size={16} className="text-red-400" />
                        Unmute Video
                      </>
                    ) : (
                      <>
                        <Volume2 size={16} className="text-emerald-400" />
                        Mute Video
                      </>
                    )}
                  </button>

                  {/* Close/Dismiss Button */}
                  <button
                    onClick={handleDismiss}
                    className="flex-1 py-3 px-4 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-200 font-mono text-sm border border-emerald-800/50 cursor-pointer flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                  >
                    <X size={16} />
                    Exit Sanctuary
                  </button>
                </div>

                <div className="text-center">
                  <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
                    Sunath containment protocol active
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
