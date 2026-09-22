import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, KeyRound, User, Phone, MapPin, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();
  const hasMinLength = password.length >= 12;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      return;
    }
    setSubmitting(true);
    const success = await signup(name, email, password, phone, {
      street,
      city,
      state: 'Karnataka',
      postalCode
    });
    setSubmitting(false);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-stone-100 mb-1">
          Join Honey Juice Boutique
        </h2>
        <p className="text-xs text-stone-400">
          Create an account for artisanal cold-pressed deliveries
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-[11px] font-semibold text-stone-300 uppercase tracking-wider mb-1">
            Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Priya Sharma"
              className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-stone-300 uppercase tracking-wider mb-1">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="priya@example.com"
              className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-stone-300 uppercase tracking-wider mb-1">
            Password (Policy Enforced) *
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 12 chars (e.g. ArtisanJuice2026)"
              minLength={12}
              className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono"
              required
            />
          </div>

          {/* Password Policy Indicator */}
          {password.length > 0 && (
            <div className="mt-2 p-2.5 rounded-xl bg-obsidian-950 border border-stone-800 space-y-1.5 text-[11px]">
              <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block">
                Password Requirements:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-400 font-medium' : 'text-stone-500'}`}>
                  <span>{hasMinLength ? '✓' : '○'}</span>
                  <span>12+ Characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasUpperCase ? 'text-emerald-400 font-medium' : 'text-stone-500'}`}>
                  <span>{hasUpperCase ? '✓' : '○'}</span>
                  <span>Uppercase (A-Z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasLowerCase ? 'text-emerald-400 font-medium' : 'text-stone-500'}`}>
                  <span>{hasLowerCase ? '✓' : '○'}</span>
                  <span>Lowercase (a-z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-400 font-medium' : 'text-stone-500'}`}>
                  <span>{hasNumber ? '✓' : '○'}</span>
                  <span>Number (0-9)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-semibold text-stone-300 uppercase tracking-wider mb-1">
              Phone
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
              className="w-full glass-input rounded-xl px-3 py-2.5 text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-stone-300 uppercase tracking-wider mb-1">
              City
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Bengaluru"
              className="w-full glass-input rounded-xl px-3 py-2.5 text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-stone-300 uppercase tracking-wider mb-1">
            Delivery Street Address
          </label>
          <input
            type="text"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder="12 Orchard Road, Indiranagar"
            className="w-full glass-input rounded-xl px-3 py-2.5 text-xs"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 px-4 mt-2 rounded-xl bg-gradient-to-r from-honey-500 to-amber-600 hover:from-honey-400 hover:to-amber-500 text-stone-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-honey-950 transition-all active:scale-[0.99] disabled:opacity-50"
        >
          <UserPlus className="w-4 h-4" />
          <span>{submitting ? 'Registering...' : 'Complete Registration'}</span>
        </button>
      </form>

      <div className="text-center text-xs text-stone-400">
        Already have an account?{' '}
        <Link to="/login" className="text-honey-400 font-semibold hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
};
