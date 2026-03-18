import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Fuel, ShoppingBag, ArrowRight, Zap, Clock, MapPin, 
  ChevronRight, CheckCircle2, XCircle, Power, Truck, 
  Navigation, Star, Wallet, Menu, User as UserIcon, 
  Bell, Settings, Layers, Map as MapIcon, Store, Shield
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { User } from '../types';
import { db, doc, updateDoc, handleFirestoreError, OperationType } from '../firebase';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DashboardProps {
  user: User | null;
}

const MOCK_ORDERS = [
  {
    id: 'FL-8921',
    date: 'Mar 15, 2026',
    total: 45.50,
    status: 'delivered',
    station: 'Flash Hub Central'
  },
  {
    id: 'FL-7742',
    date: 'Mar 12, 2026',
    total: 32.00,
    status: 'delivered',
    station: 'Rapid Refuel North'
  },
  {
    id: 'FL-6610',
    date: 'Mar 08, 2026',
    total: 120.00,
    status: 'cancelled',
    station: 'EcoGas Express'
  }
];

const MOCK_RIDER_ORDERS = [
  {
    id: 'FL-9001',
    customer: 'Alice Johnson',
    address: '742 Evergreen Terrace',
    type: 'Premium Fuel',
    amount: '45L',
    status: 'pending',
    distance: '1.2 km',
    price: 12.50
  },
  {
    id: 'FL-9002',
    customer: 'Bob Smith',
    address: '123 Maple St',
    type: 'Regular Fuel',
    amount: '30L',
    status: 'confirmed',
    distance: '2.8 km',
    price: 18.00
  }
];

export default function Dashboard({ user }: DashboardProps) {
  const navigate = useNavigate();

  const handleToggleOnline = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        isOnline: !user.isOnline
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  if (user?.role === 'rider') {
    return (
      <div className="fixed inset-0 bg-stone-950 text-white overflow-hidden flex flex-col">
        {/* Map Background (Simulated) */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://picsum.photos/seed/rider-map/1200/1200?blur=2" 
            alt="Map" 
            className="w-full h-full object-cover opacity-30 grayscale"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/80 via-transparent to-stone-950/90" />
          
          {/* Simulated Map Markers */}
          {user.isOnline && (
            <>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-6 h-6 bg-blue-500 rounded-full border-4 border-white shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-pulse" />
              </div>
              <div className="absolute top-1/3 left-1/4">
                <div className="w-4 h-4 bg-accent rounded-full border-2 border-white shadow-lg" />
              </div>
              <div className="absolute bottom-1/3 right-1/4">
                <div className="w-4 h-4 bg-accent rounded-full border-2 border-white shadow-lg" />
              </div>
            </>
          )}
        </div>

        {/* Top Navigation Bar */}
        <header className="relative z-20 p-4 flex items-center justify-between bg-stone-900/40 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => alert('Settings coming soon')}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Earnings</span>
              <div className="flex items-center gap-1">
                <Wallet size={14} className="text-accent" />
                <span className="text-lg font-black tracking-tight italic">$142.50</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1 bg-stone-800/80 px-2 py-1 rounded-lg border border-white/5">
                <Star size={12} className="text-accent fill-accent" />
                <span className="text-xs font-black">4.95</span>
              </div>
            </div>
            <button className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-stone-950 shadow-lg shadow-accent/20">
              <UserIcon size={20} />
            </button>
          </div>
        </header>

        {/* Verification Status (New) */}
        {!user.ghanaCardFront && (
          <div className="relative z-20 m-4 p-4 bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white">
                <Shield size={20} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-red-200">Verification Required</p>
                <p className="text-[10px] text-red-100/60 font-medium">Please upload your Ghana Card to start working.</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/signup/rider')} 
              className="bg-white text-red-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-colors"
            >
              Upload Now
            </button>
          </div>
        )}

        {/* Floating Action Buttons */}
        <div className="absolute right-4 top-24 z-10 flex flex-col gap-3">
          <button 
            onClick={() => alert('Notifications coming soon')}
            className="w-12 h-12 rounded-2xl bg-stone-900/80 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-xl"
          >
            <Bell size={20} />
          </button>
          <button 
            onClick={() => alert('Map layers coming soon')}
            className="w-12 h-12 rounded-2xl bg-stone-900/80 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-xl"
          >
            <Layers size={20} />
          </button>
          <button 
            onClick={() => alert('Recenter map')}
            className="w-12 h-12 rounded-2xl bg-stone-900/80 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-xl"
          >
            <MapIcon size={20} />
          </button>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 relative z-10 flex flex-col justify-end p-4 pb-24">
          <AnimatePresence mode="wait">
            {user.isOnline ? (
              <motion.div 
                key="online"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-sm font-black uppercase tracking-widest italic text-stone-400">Nearby Requests</h2>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-tighter">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Scanning
                  </span>
                </div>

                <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar">
                  {MOCK_RIDER_ORDERS.map((order, i) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-stone-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl group active:scale-[0.98] transition-all"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-3">
                          <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center text-accent">
                            <Fuel size={24} />
                          </div>
                          <div>
                            <h3 className="font-black text-lg tracking-tight italic leading-none mb-1">{order.type}</h3>
                            <p className="text-xs text-stone-400 font-medium flex items-center gap-1">
                              <Navigation size={10} /> {order.distance} away
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-black text-accent italic leading-none mb-1">${order.price.toFixed(2)}</p>
                          <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Est. Payout</p>
                        </div>
                      </div>

                      <div className="space-y-3 mb-5">
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-stone-500 mt-1.5" />
                          <p className="text-xs font-medium text-stone-300 leading-tight">{order.address}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => alert('Order declined')}
                          className="bg-stone-800 hover:bg-stone-700 text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl transition-all"
                        >
                          Decline
                        </button>
                        <button 
                          onClick={() => navigate(`/tracking/${order.id}`)}
                          className="bg-accent hover:bg-accent/90 text-stone-950 font-black text-xs uppercase tracking-widest py-4 rounded-2xl transition-all shadow-lg shadow-accent/20"
                        >
                          Accept
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="offline"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="text-center space-y-6 mb-12"
              >
                <div className="w-24 h-24 bg-stone-900/60 backdrop-blur-md rounded-full flex items-center justify-center mx-auto border border-white/5 shadow-2xl">
                  <Power size={48} className="text-stone-700" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter">You are Offline</h2>
                  <p className="text-stone-500 font-medium max-w-[240px] mx-auto text-sm">Go online to start receiving high-payout delivery requests in your area.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Bottom Status Bar / Go Online Button */}
        <footer className="relative z-30 p-4 bg-stone-900/80 backdrop-blur-2xl border-t border-white/5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleToggleOnline}
            className={`w-full py-5 rounded-[2rem] font-black text-lg uppercase tracking-[0.2em] italic transition-all shadow-2xl flex items-center justify-center gap-3 ${
              user.isOnline 
                ? 'bg-stone-800 text-stone-400 border border-white/5' 
                : 'bg-accent text-stone-950 shadow-accent/20'
            }`}
          >
            {user.isOnline ? (
              <>
                <XCircle size={24} />
                <span>Go Offline</span>
              </>
            ) : (
              <>
                <Zap size={24} className="fill-stone-950" />
                <span>Go Online</span>
              </>
            )}
          </motion.button>
        </footer>

        <style dangerouslySetInnerHTML={{ __html: `
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
          }
        `}} />
      </div>
    );
  }

  if (user?.role === 'merchant') {
    return (
      <div className="space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-stone-900 tracking-tighter italic uppercase">Merchant <span className="text-emerald-600">Dashboard</span></h1>
            <p className="text-stone-500 font-medium">Manage your shop and fulfill customer orders.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Store Status</p>
              <p className="text-sm font-black text-emerald-700 uppercase">Open & Active</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Today\'s Orders', value: '12', icon: ShoppingBag, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Pending Prep', value: '3', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Total Sales', value: '$420.50', icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Store Rating', value: '4.8', icon: Star, color: 'text-accent', bg: 'bg-accent/10' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-black text-stone-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[2.5rem] border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-stone-100 flex items-center justify-between">
            <h2 className="text-xl font-black text-stone-900 uppercase tracking-tight italic">Active Orders</h2>
            <button 
              onClick={() => alert('Full order history coming soon')}
              className="text-emerald-600 font-bold text-sm hover:underline"
            >
              View All
            </button>
          </div>
          <div className="p-8 text-center space-y-4">
            <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto text-stone-300">
              <ShoppingBag size={40} />
            </div>
            <p className="text-stone-500 font-medium">No new orders at the moment. We'll notify you when someone buys from your shop!</p>
          </div>
        </div>
      </div>
    );
  }

  const actions = [
    {
      id: 'gas',
      title: 'Fill My Gas',
      description: 'Request a fuel delivery to your current location in minutes.',
      icon: Fuel,
      path: '/order',
      color: 'bg-primary',
      textColor: 'text-white',
      accent: 'text-accent'
    },
    {
      id: 'store',
      title: 'Shop Store',
      description: 'Browse nearby stations for snacks, additives, and car care.',
      icon: ShoppingBag,
      path: '/',
      color: 'bg-stone-900',
      textColor: 'text-white',
      accent: 'text-primary'
    }
  ];

  return (
    <div className="space-y-10 pb-10">
      {/* Welcome Header */}
      <section className="space-y-2">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl font-black text-stone-900 tracking-tighter italic uppercase"
        >
          Welcome back, <span className="text-primary">{user?.displayName?.split(' ')[0] || 'Flash'}</span>
        </motion.h1>
        <p className="text-stone-500 font-medium">What would you like to do today?</p>
      </section>

      {/* Main Actions */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {actions.map((action, i) => (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => navigate(action.path)}
            className={`group relative overflow-hidden rounded-[2.5rem] p-8 text-left transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl ${action.color} ${action.textColor}`}
          >
            <div className="relative z-10 space-y-6">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 group-hover:scale-110 transition-transform">
                <action.icon size={32} />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tighter italic uppercase leading-none">
                  {action.title}
                </h2>
                <p className="opacity-60 font-medium max-w-[240px] text-sm leading-relaxed">
                  {action.description}
                </p>
              </div>
              <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest pt-2">
                <span>Request Now</span>
                <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
              </div>
            </div>

            {/* Background Decorative Icon */}
            <action.icon 
              size={200} 
              className={`absolute -right-10 -bottom-10 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-700 ${action.accent}`} 
            />
          </motion.button>
        ))}
      </section>

      {/* Recent Activity / Quick Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
            <Zap size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Flash Points</p>
            <p className="text-xl font-black text-stone-900">1,250</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Last Order</p>
            <p className="text-xl font-black text-stone-900">2 days ago</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
            <MapPin size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Saved Locations</p>
            <p className="text-xl font-black text-stone-900">3</p>
          </div>
        </div>
      </section>

      {/* Order History */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-stone-900 tracking-tight uppercase italic">Order History</h2>
          <button 
            onClick={() => alert('Full history coming soon')}
            className="text-primary font-bold text-sm hover:underline"
          >
            View All
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm overflow-hidden">
          {MOCK_ORDERS.map((order, i) => (
            <motion.button
              key={order.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
              onClick={() => navigate(`/tracking/${order.id}`)}
              className="w-full flex items-center justify-between p-6 hover:bg-stone-50 transition-colors border-b border-stone-50 last:border-0 group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  order.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                }`}>
                  {order.status === 'delivered' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-stone-900 tracking-tight">{order.id}</span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-stone-100 text-stone-500 uppercase tracking-widest">
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 font-medium">{order.date} • {order.station}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-black text-stone-900">${order.total.toFixed(2)}</p>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Total Paid</p>
                </div>
                <ChevronRight size={20} className="text-stone-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </motion.button>
          ))}
        </div>
      </section>
    </div>
  );
}
