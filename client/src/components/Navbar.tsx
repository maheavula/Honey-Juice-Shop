import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  User,
  Shield,
  LogOut,
  Sparkles,
  Menu,
  X,
  Package,
  Heart,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';

import { HoneyBottleLogo } from './HoneyBottleLogo';

export const Navbar: React.FC = () => {
  const { user, isAdmin, isAuthenticated, logout } = useAuth();
  const { totalItems, totalPaise, toggleDrawer } = useCart();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-obsidian-950/80 backdrop-blur-xl border-b border-honey-500/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-obsidian-900 to-obsidian-850 border border-honey-500/40 flex items-center justify-center p-1.5 shadow-lg shadow-honey-900/30 group-hover:scale-105 group-hover:border-honey-400 transition-all duration-300">
            <HoneyBottleLogo className="w-7 h-7" />
          </div>
          <div>
            <span className="font-display text-xl font-bold tracking-tight text-stone-100 flex items-center gap-1.5">
              Honey <span className="gold-gradient-text">Juice</span> Shop
            </span>
            <span className="text-[10px] uppercase tracking-widest text-honey-400 font-semibold block -mt-1">
              Raw • Cold-Pressed • Artisanal
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-300">
          <Link
            to="/"
            className={`transition-colors hover:text-honey-400 ${
              location.pathname === '/' ? 'text-honey-400 font-semibold' : ''
            }`}
          >
            Boutique Menu
          </Link>
          <Link
            to="/my-orders"
            className={`transition-colors hover:text-honey-400 ${
              location.pathname === '/my-orders' ? 'text-honey-400 font-semibold' : ''
            }`}
          >
            Track Orders
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-honey-500/15 text-honey-300 border border-honey-500/30 hover:bg-honey-500/25 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-honey-400" />
              <span>Admin Management</span>
            </Link>
          )}
        </nav>

        {/* Actions: Cart + Auth Dropdown */}
        <div className="flex items-center gap-3">
          {/* Cart Trigger */}
          <button
            onClick={toggleDrawer}
            className="relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-obsidian-900 border border-honey-500/25 hover:border-honey-500/50 hover:bg-obsidian-850 transition-all duration-200 group"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-honey-400 group-hover:scale-110 transition-transform" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2.5 w-5 h-5 rounded-full bg-citrus-500 text-stone-950 font-bold text-xs flex items-center justify-center animate-pulse">
                  {totalItems}
                </span>
              )}
            </div>
            <span className="hidden sm:inline font-semibold text-xs text-honey-300">
              {totalPaise > 0 ? formatCurrency(totalPaise) : 'Cart'}
            </span>
          </button>

          {/* User Account Menu */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-obsidian-900 border border-stone-800 hover:border-honey-500/30 text-stone-200 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-600 to-honey-400 text-stone-950 font-bold text-xs flex items-center justify-center">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-xs font-medium max-w-[100px] truncate">
                  {user?.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-obsidian-900/95 border border-honey-500/20 backdrop-blur-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-stone-800">
                    <p className="text-xs font-semibold text-stone-100">{user?.name}</p>
                    <p className="text-[11px] text-stone-400 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-honey-500/20 text-honey-400 border border-honey-500/30">
                      {user?.role}
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-stone-300 hover:text-honey-400 hover:bg-stone-800/60"
                    >
                      <User className="w-4 h-4" />
                      <span>Profile & Address</span>
                    </Link>
                    <Link
                      to="/my-orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-stone-300 hover:text-honey-400 hover:bg-stone-800/60"
                    >
                      <Package className="w-4 h-4" />
                      <span>My Orders</span>
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-honey-400 font-semibold hover:bg-stone-800/60"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Admin Console</span>
                      </Link>
                    )}
                  </div>

                  <div className="pt-1 border-t border-stone-800">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/30 text-left transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-300 hover:text-white hover:bg-stone-800/60 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-honey-500 text-stone-950 hover:bg-honey-400 transition-colors shadow-md shadow-honey-950"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-stone-400 hover:text-white rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-800 bg-obsidian-900/95 p-4 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-stone-200 hover:text-honey-400 py-1"
          >
            Boutique Menu
          </Link>
          <Link
            to="/my-orders"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-stone-200 hover:text-honey-400 py-1"
          >
            Track Orders
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-honey-400 font-semibold py-1"
            >
              Admin Management Portal
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
