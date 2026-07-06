import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertCircle, Hash, Lock, ChevronLeft } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const [reg, setReg] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { adminLogin, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!reg) {
      setError('Registration number is required.');
      setIsLoading(false);
      return;
    }

    if (!password) {
      setError('Password is required.');
      setIsLoading(false);
      return;
    }

    try {
      await adminLogin(reg, password);
      navigate('/');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid admin credentials.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <button 
        onClick={() => navigate(-1)}
        className="mb-8 flex items-center gap-2 neu-btn px-4 py-2.5 text-xs font-bold text-text-secondary hover:text-text-primary rounded-xl"
      >
        <ChevronLeft size={16} />
        Back to Dashboard
      </button>

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
            <ShieldCheck className="text-orange-500" size={28} />
          </motion.div>
          <h1 className="text-3xl font-bold gradient-text">Admin Access</h1>
          <p className="text-text-secondary mt-2 text-sm">Elevated privileges required</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                className="w-full neu-input rounded-xl py-3.5 pl-11 pr-4 text-text-primary placeholder:text-text-secondary/40 focus:outline-none transition-all font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="pass" className="text-xs font-bold text-text-secondary block uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary">
                <Lock size={18} />
              </div>
              <input
                id="pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full neu-input rounded-xl py-3.5 pl-11 pr-4 text-text-primary placeholder:text-text-secondary/40 focus:outline-none transition-all"
              />
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full neu-btn text-orange-500 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? 'Authenticating...' : 'Authorize Access'}
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
      </motion.div>
    </div>
  );
};

export default AdminLogin;
