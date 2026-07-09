import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Volume2, Sparkles, X } from 'lucide-react';
import shyamImg from '../assets/shyam.png';
import shyamAudio from '../assets/shyam.m4a';

const TARGET_ROLL_NUMBERS = [
  '2117240070308',
  '2117240070291',
  '2117240070306',
  '2117240070256',
  '2117240070293'
];

export const ShyamEasterEgg: React.FC = () => {
  // Temporarily paused
  return null;

  const { user } = useAuth();
  const [shouldShow, setShouldShow] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (user && TARGET_ROLL_NUMBERS.includes(user.regNum)) {
      const alreadyShown = sessionStorage.getItem('shyam_easter_egg_shown');
      if (!alreadyShown) {
        setShouldShow(true);
      }
    }
  }, [user]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  if (!shouldShow) return null;

  const startEasterEgg = () => {
    setIsPlaying(true);
    const audio = new Audio(shyamAudio);
    audio.loop = true;
    audio.volume = 0.8;
    audioRef.current = audio;
    audio.play().catch(err => {
      console.error("Audio playback failed:", err);
    });
  };

  const handleDismiss = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setShouldShow(false);
    sessionStorage.setItem('shyam_easter_egg_shown', 'true');
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const newMuteState = !isMuted;
      audioRef.current.muted = newMuteState;
      setIsMuted(newMuteState);
    }
  };

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 overflow-hidden select-none"
        >
          {/* Psychedelic Flashing Background once playing */}
          {isPlaying && (
            <motion.div
              animate={{
                background: [
                  'radial-gradient(circle, rgba(239,68,68,0.25) 0%, rgba(0,0,0,1) 75%)',
                  'radial-gradient(circle, rgba(168,85,247,0.25) 0%, rgba(0,0,0,1) 75%)',
                  'radial-gradient(circle, rgba(59,130,246,0.25) 0%, rgba(0,0,0,1) 75%)',
                  'radial-gradient(circle, rgba(16,185,129,0.25) 0%, rgba(0,0,0,1) 75%)',
                  'radial-gradient(circle, rgba(239,68,68,0.25) 0%, rgba(0,0,0,1) 75%)',
                ]
              }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="absolute inset-0 z-0 pointer-events-none"
            />
          )}

          {/* Matrix-like falling grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.25)_50%),_linear-gradient(90deg,_rgba(255,0,0,0.06),_rgba(0,255,0,0.02),_rgba(0,0,255,0.06))] bg-[size:100%_4px,_6px_100%] pointer-events-none z-10" />

          {/* Stage 1: The Warning Trigger */}
          {!isPlaying ? (
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="relative z-20 w-full max-w-md p-8 m-4 rounded-2xl bg-zinc-900 border border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.2)] text-center text-white"
            >
              <div className="flex justify-center mb-6">
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  className="p-4 bg-red-500/10 rounded-full border border-red-500/30 text-red-500"
                >
                  <ShieldAlert size={48} className="animate-pulse" />
                </motion.div>
              </div>

              <h2 className="text-2xl font-black tracking-widest text-red-500 uppercase mb-3 font-mono">
                System Anomaly Detected
              </h2>
              <p className="text-zinc-400 text-sm font-mono leading-relaxed mb-6">
                A critical level of <span className="text-red-400 font-bold">SHYAM ENERGY</span> is radiating from this registration number.
                Vessel containment is highly recommended to prevent standard database breakdown.
              </p>

              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={startEasterEgg}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold tracking-wider font-mono shadow-[0_4px_20px_rgba(239,68,68,0.4)] border border-red-400/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Volume2 size={18} />
                  RESOLVE ANOMALY (RECOMMENDED)
                </motion.button>

                <button
                  onClick={handleDismiss}
                  className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-sm font-medium font-mono border border-zinc-700/50 cursor-pointer transition-colors"
                >
                  Skip warning and bypass
                </button>
              </div>
            </motion.div>
          ) : (
            /* Stage 2: Crazy Shyam mode */
            <div className="relative z-20 w-full h-full flex flex-col items-center justify-between p-6">
              {/* Dynamic Header */}
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center mt-8"
              >
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 animate-pulse font-mono uppercase select-none">
                  🌟 SHYAM MODE ENABLED 🌟
                </h1>
                <p className="text-zinc-400 mt-2 font-mono text-sm tracking-widest flex items-center justify-center gap-2">
                  <Sparkles size={16} className="text-yellow-400" />
                  Maximum containment levels reached
                  <Sparkles size={16} className="text-yellow-400" />
                </p>
              </motion.div>

              {/* Central Shyam Image Container with funny animations */}
              <div className="flex-grow flex items-center justify-center relative w-full max-w-lg">
                {/* Background glow behind Shyam */}
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.7, 0.3],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                  className="absolute w-72 h-72 rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 blur-3xl opacity-50"
                />

                {/* Animated Shyam Image */}
                <motion.div
                  initial={{ scale: 0, rotate: -720 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 80, damping: 12 }}
                  className="relative z-30"
                >
                  <motion.div
                    animate={{
                      y: [0, -12, 12, -8, 8, 0],
                      x: [0, 8, -8, 4, -4, 0],
                      rotate: [0, 8, -8, 5, -5, 0],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 3,
                      ease: "easeInOut",
                      repeatType: "reverse"
                    }}
                  >
                    <img
                      src={shyamImg}
                      alt="Shyam"
                      className="w-64 h-64 md:w-80 md:h-80 object-contain rounded-3xl border-4 border-yellow-400 shadow-[0_0_50px_rgba(234,179,8,0.5)] bg-zinc-900/50 p-2"
                    />
                  </motion.div>
                  {/* Funny stickers popping from behind */}
                  <motion.div
                    animate={{ scale: [0.8, 1.2, 0.8], rotate: [-10, 10, -10] }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                    className="absolute -top-6 -right-6 bg-red-600 text-white font-mono text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-red-400 rotate-12"
                  >
                    Downcis Shyam
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1.2, 0.8, 1.2], rotate: [15, -15, 15] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="absolute -bottom-4 -left-6 bg-purple-600 text-white font-mono text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-purple-400 -rotate-12"
                  >
                    Maanbumigu Madapunda
                  </motion.div>
                </motion.div>

                {/* Funny mini floaters floating across the screen */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{
                        x: Math.random() > 0.5 ? -100 : 500,
                        y: Math.random() * 400,
                        scale: Math.random() * 0.4 + 0.4,
                        opacity: 0
                      }}
                      animate={{
                        x: Math.random() > 0.5 ? [500, -100] : [-100, 500],
                        y: [Math.random() * 400, Math.random() * 400],
                        opacity: [0, 0.8, 0],
                        rotate: [0, 360]
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: Math.random() * 4 + 3,
                        ease: "linear"
                      }}
                      className="absolute"
                    >
                      <img src={shyamImg} alt="Mini Shyam" className="w-12 h-12 opacity-60 filter hue-rotate-90 rounded-full" />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Bottom Controls */}
              <div className="w-full max-w-sm mb-8 space-y-4">
                <div className="flex gap-4">
                  {/* Mute Button */}
                  <button
                    onClick={toggleMute}
                    className="flex-1 py-3 px-4 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 font-mono text-sm border border-zinc-800 cursor-pointer flex items-center justify-center gap-2 transition-all"
                  >
                    <Volume2 size={16} className={isMuted ? "opacity-50 line-through" : ""} />
                    {isMuted ? "Unmute Audio" : "Mute Audio"}
                  </button>

                  {/* Close/Dismiss Button */}
                  <button
                    onClick={handleDismiss}
                    className="flex-1 py-3 px-4 rounded-xl bg-red-950/80 hover:bg-red-900/80 text-red-200 font-mono text-sm border border-red-900/50 cursor-pointer flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                  >
                    <X size={16} />
                    Exit Containment
                  </button>
                </div>

                <div className="text-center">
                  <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
                    Frissco Laboratories • Containment Protocol Alpha
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
