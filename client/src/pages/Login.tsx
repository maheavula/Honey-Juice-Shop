import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, KeyRound, Mail, Sparkles, Shield, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const success = await login(email, password);
    setSubmitting(false);
    if (success) {
      navigate('/');
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-stone-100 mb-1">
          Welcome Back
        </h2>
        <p className="text-xs text-stone-400">
          Sign in to your artisanal boutique account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@honeyjuiceshop.local"
              className="w-full glass-input rounded-xl pl-10 pr-4 py-3 text-xs"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full glass-input rounded-xl pl-10 pr-4 py-3 text-xs"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-honey-500 to-amber-600 hover:from-honey-400 hover:to-amber-500 text-stone-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-honey-950 transition-all active:scale-[0.99] disabled:opacity-50"
        >
          <LogIn className="w-4 h-4" />
          <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
        </button>
      </form>

      {/* Demo Credentials Helper */}
      <div className="pt-4 border-t border-stone-800/80 space-y-2.5">
        <span className="text-[11px] font-semibold text-honey-400 uppercase tracking-wider block text-center">
          Instant Demo Quick-Fill
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickFill('admin@honeyjuiceshop.local', 'Admin#HoneyJuice2026!')}
            className="p-2.5 rounded-xl bg-obsidian-950 border border-honey-500/20 hover:border-honey-500/50 text-left transition-colors group"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-honey-300 group-hover:text-honey-200">
              <Shield className="w-3.5 h-3.5 text-honey-400" />
              <span>Admin Demo</span>
            </div>
            <div className="text-[10px] text-stone-500 truncate">admin@honeyjuiceshop.local</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickFill('customer@honeyjuiceshop.local', 'Customer@Juice2026')}
            className="p-2.5 rounded-xl bg-obsidian-950 border border-stone-800 hover:border-stone-700 text-left transition-colors group"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-300 group-hover:text-stone-200">
              <User className="w-3.5 h-3.5 text-stone-400" />
              <span>Customer Demo</span>
            </div>
            <div className="text-[10px] text-stone-500 truncate">customer@honeyjuiceshop.local</div>
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-stone-400 pt-2">
        Don't have an account yet?{' '}
        <Link to="/signup" className="text-honey-400 font-semibold hover:underline">
          Register here
        </Link>
      </div>
    </div>
  );
};
