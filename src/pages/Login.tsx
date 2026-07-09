import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { LogIn, AlertCircle, Hash, Lock } from 'lucide-react';
import { clsx } from 'clsx';

const Login: React.FC = () => {
  const [role, setRole] = useState<'student' | 'faculty'>('student');
  const [reg, setReg] = useState('');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, facultyLogin, user, isFaculty } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    } else if (isFaculty) {
      navigate('/faculty');
    }
  }, [user, isFaculty, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (role === 'student') {
      if (!reg || reg.length < 10) {
        setError('Please enter a valid registration number.');
        setIsLoading(false);
        return;
      }
      try {
        await login(reg);
        navigate('/');
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Invalid registration number.';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!passcode) {
        setError('Please enter the faculty passcode.');
        setIsLoading(false);
        return;
      }
      try {
        await facultyLogin(passcode);
        navigate('/faculty');
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Invalid passcode.';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md neu-flat rounded-2xl p-8"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="w-16 h-16 neu-flat rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border-color/10"
          >
            <LogIn className="text-accent-blue" size={28} />
          </motion.div>
          <h1 className="text-3xl font-bold gradient-text">Magister</h1>
          <p className="text-text-secondary mt-2 text-sm">
            {role === 'student' ? 'Enter your registration number' : 'Enter faculty passcode'} to continue
          </p>
        </div>

        <div className="flex bg-bg-card p-1 rounded-xl mb-6 shadow-inner border border-border-color/5">
          <button
            onClick={() => setRole('student')}
            className={clsx(
              "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
              role === 'student' ? "bg-bg-primary text-accent-blue shadow-md" : "text-text-secondary hover:text-text-primary"
            )}
          >
            Student
          </button>
          <button
            onClick={() => setRole('faculty')}
            className={clsx(
              "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
              role === 'faculty' ? "bg-bg-primary text-accent-blue shadow-md" : "text-text-secondary hover:text-text-primary"
            )}
          >
            Faculty
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {role === 'student' ? (
            <div className="space-y-2">
              <label htmlFor="reg" className="text-xs font-bold text-text-secondary block uppercase tracking-wider">
                Registration Number
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary">
                  <Hash size={18} />
                </div>
                <input
                  id="reg"
                  type="text"
                  value={reg}
                  onChange={(e) => setReg(e.target.value)}
                  placeholder="2117240070XXX"
                  maxLength={13}
                  className="w-full neu-input rounded-xl py-3.5 pl-11 pr-4 text-text-primary placeholder:text-text-secondary/40 focus:outline-none transition-all font-mono"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label htmlFor="passcode" className="text-xs font-bold text-text-secondary block uppercase tracking-wider">
                Faculty Passcode
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary">
                  <Lock size={18} />
                </div>
                <input
                  id="passcode"
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter passcode"
                  className="w-full neu-input rounded-xl py-3.5 pl-11 pr-4 text-text-primary placeholder:text-text-secondary/40 focus:outline-none transition-all"
                />
              </div>
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full neu-btn text-accent-blue font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </motion.button>
        </form>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm"
          >
            <AlertCircle size={18} className="shrink-0" />
            <p className="font-medium">{error}</p>
          </motion.div>
        )}

        <div className="mt-8 text-center">
          <p className="text-[10px] uppercase font-bold tracking-widest text-text-secondary/60">
            AI & DS Department • Frissco Digital Ventures
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
