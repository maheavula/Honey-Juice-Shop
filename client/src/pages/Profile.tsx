import React, { useState, useEffect } from 'react';
import { User, MapPin, Phone, Mail, Save, Sparkles, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { customerApi } from '../services/api';

export const Profile: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setStreet(user.address?.street || '');
      setCity(user.address?.city || '');
      setState(user.address?.state || '');
      setPostalCode(user.address?.postalCode || '');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await customerApi.updateProfile({
        name,
        phone,
        address: {
          street,
          city,
          state,
          postalCode
        }
      });

      if (res.success) {
        showToast('Profile and delivery details updated successfully!', 'success', 'Saved');
        await refreshProfile();
      } else {
        showToast(res.error || 'Failed to update profile', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-100">
          Customer Profile & Preferences
        </h1>
        <p className="text-xs text-stone-400">
          Manage your personal details and default cold-chain delivery address
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Info */}
        <div className="p-6 rounded-2xl bg-obsidian-900 border border-stone-800 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-stone-800">
            <User className="w-4 h-4 text-honey-400" />
            <h3 className="font-display font-semibold text-stone-200 text-sm">
              Account Details
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full glass-input rounded-xl p-3 text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                Email Address (Permanent)
              </label>
              <div className="flex items-center gap-2 w-full p-3 rounded-xl bg-obsidian-950 border border-stone-800 text-xs text-stone-400">
                <Mail className="w-3.5 h-3.5 text-stone-600" />
                <span>{user?.email}</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-500" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full glass-input rounded-xl pl-9 pr-3 py-3 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                Account Role
              </label>
              <div className="p-3 rounded-xl bg-obsidian-950 border border-stone-800 text-xs text-honey-400 font-semibold uppercase flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>{user?.role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Saved Address */}
        <div className="p-6 rounded-2xl bg-obsidian-900 border border-stone-800 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-stone-800">
            <MapPin className="w-4 h-4 text-honey-400" />
            <h3 className="font-display font-semibold text-stone-200 text-sm">
              Default Delivery Address
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="45 Green Park"
                className="w-full glass-input rounded-xl p-3 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Bengaluru"
                  className="w-full glass-input rounded-xl p-3 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Karnataka"
                  className="w-full glass-input rounded-xl p-3 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                  Postal PIN Code
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="560025"
                  className="w-full glass-input rounded-xl p-3 text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-honey-500 to-amber-600 hover:from-honey-400 hover:to-amber-500 text-stone-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-honey-950 transition-all active:scale-[0.99] disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Updates...' : 'Save Profile Changes'}</span>
        </button>
      </form>
    </div>
  );
};
