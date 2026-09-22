import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { HoneyBottleLogo } from '../components/HoneyBottleLogo';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-obsidian-950 flex flex-col items-center justify-center p-4 selection:bg-honey-500 selection:text-black">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-honey-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 w-[400px] h-[400px] bg-citrus-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 group mb-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-obsidian-900 to-obsidian-850 border border-honey-500/40 flex items-center justify-center p-1.5 shadow-lg shadow-honey-900/40 group-hover:scale-105 group-hover:border-honey-400 transition-all duration-300">
              <HoneyBottleLogo className="w-7 h-7" />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-stone-100">
              Honey <span className="gold-gradient-text">Juice</span> Shop
            </span>
          </Link>
          <p className="text-xs text-stone-400">
            Artisanal Cold-Pressed & Wild Forest Honey Infusions
          </p>
        </div>

        {/* Outlet Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-honey-500/20">
          <Outlet />
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-honey-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Boutique Store</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
