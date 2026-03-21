import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, ShoppingCart, MapPin, User, Settings, LogOut, Zap } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { auth, signInWithPopup, GoogleAuthProvider, signOut } from '../firebase';
import { User as AppUser } from '../types';
import ChatBot from './ChatBot';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LayoutProps {
  children: React.ReactNode;
  user: AppUser | null;
}

export default function Layout({ children, user }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/signup-category');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const navItems = [
    { icon: Home, label: 'Home', path: user ? '/dashboard' : '/' },
    { icon: ShoppingCart, label: 'Order', path: '/order' },
    { icon: MapPin, label: 'Tracking', path: '/tracking/active', hidden: !user },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-1 group">
            <span className="font-black text-xl tracking-tighter text-stone-900 italic">FLASH</span>
            <Zap className="text-accent fill-accent -rotate-12 group-hover:rotate-0 transition-transform" size={24} />
            <span className="font-black text-xl tracking-tighter text-stone-900 italic">DELIVERY</span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-stone-900">{user.displayName || 'User'}</p>
                  <p className="text-xs text-stone-500 capitalize">{user.role}</p>
                </div>
                <div className="group relative">
                  <div className="w-10 h-10 rounded-full bg-stone-200 border border-stone-300 overflow-hidden cursor-pointer">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} alt="avatar" />
                  </div>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-stone-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <button 
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button 
                onClick={handleGetStarted}
                className="text-sm font-black uppercase tracking-widest text-white bg-primary hover:bg-primary/90 px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-95"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-md mx-auto w-full px-4 py-6 mb-20 sm:mb-0">
        {children}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 px-6 py-3 flex justify-between items-center z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        {navItems.filter(item => !item.hidden).map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 transition-colors",
                isActive ? "text-primary" : "text-stone-400"
              )}
            >
              <item.icon size={24} />
              <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <ChatBot />
    </div>
  );
}
