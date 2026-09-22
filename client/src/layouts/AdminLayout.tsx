import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Wine,
  PackageCheck,
  Users,
  ArrowLeft,
  Shield,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import { HoneyBottleLogo } from '../components/HoneyBottleLogo';

export const AdminLayout: React.FC = () => {
  const { user, isAdmin, loading, logout } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-obsidian-950 text-honey-400">
        <Sparkles className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { label: 'Executive Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Juice Inventory', path: '/admin/juices', icon: Wine },
    { label: 'Order Fulfillment', path: '/admin/orders', icon: PackageCheck },
    { label: 'Customer Registry', path: '/admin/customers', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-obsidian-950 text-stone-100 flex flex-col md:flex-row">
      {/* Sidebar on desktop */}
      <aside className="w-full md:w-64 bg-obsidian-900 border-r border-honey-500/15 flex flex-col">
        {/* Brand */}
        <div className="p-6 border-b border-stone-800 flex items-center gap-3">
          <div className="p-1.5 rounded-xl bg-obsidian-950 border border-honey-500/30 flex items-center justify-center shadow-md">
            <HoneyBottleLogo className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display font-bold text-base text-stone-100">
              Admin Portal
            </h2>
            <p className="text-[10px] uppercase tracking-wider text-honey-400 font-semibold">
              Honey Juice Shop
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-honey-500 text-stone-950 shadow-md shadow-honey-950'
                    : 'text-stone-400 hover:text-stone-100 hover:bg-obsidian-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User & Store Return */}
        <div className="p-4 border-t border-stone-800 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-stone-400 hover:text-honey-400 hover:bg-obsidian-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Boutique</span>
          </Link>

          <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between">
            <div className="text-xs truncate">
              <div className="font-semibold text-stone-200 truncate">{user?.name}</div>
              <div className="text-[10px] text-stone-500 truncate">{user?.email}</div>
            </div>
            <button
              onClick={() => logout()}
              className="p-2 text-stone-400 hover:text-rose-400 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Workspace */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
