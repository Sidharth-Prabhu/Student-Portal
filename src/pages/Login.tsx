import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { LogIn, AlertCircle, Hash } from 'lucide-react';

const Login: React.FC = () => {
  const [reg, setReg] = useState('');
  const [error, setError] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!reg || reg.length < 10) {
      setError('Please enter a valid registration number.');
      return;
    }

    const success = login(reg);
    if (success) {
      navigate('/');
    } else {
      setError('Invalid registration number. Try again.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-bg-card border border-border-color rounded-2xl p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="w-16 h-16 bg-gradient-to-br from-accent-blue to-accent-purple rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
          >
            <LogIn className="text-white" size={32} />
          </motion.div>
          <h1 className="text-3xl font-bold gradient-text">Student Portal</h1>
          <p className="text-text-secondary mt-2">Sign in with your registration number</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="reg" className="text-sm font-medium text-text-secondary block">
              Registration Number
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
                <Hash size={18} />
              </div>
              <input
                id="reg"
                type="text"
                value={reg}
                onChange={(e) => setReg(e.target.value)}
                placeholder="2117240070XXX"
                maxLength={13}
                className="w-full bg-bg-secondary border border-border-color rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-gradient-to-r from-accent-blue to-accent-purple text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-accent-blue/20 transition-all flex items-center justify-center gap-2"
          >
            Sign In
          </motion.button>
        </form>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm"
          >
            <AlertCircle size={18} />
            <p>{error}</p>
          </motion.div>
        )}

        <div className="mt-8 text-center">
          <p className="text-xs text-text-secondary">
            AI & DS Department • Frissco Creative Labs
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
