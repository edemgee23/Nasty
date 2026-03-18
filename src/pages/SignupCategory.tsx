import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, Truck, Shield, ChevronLeft, ArrowRight, Store } from 'lucide-react';

export default function SignupCategory() {
  const navigate = useNavigate();

  const categories = [
    {
      id: 'customer',
      title: 'Customer',
      description: 'Order fuel and services delivered to your location.',
      icon: User,
      color: 'bg-primary',
      hoverColor: 'hover:bg-primary/90'
    },
    {
      id: 'rider',
      title: 'Rider',
      description: 'Join our fleet and deliver fuel to customers.',
      icon: Truck,
      color: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-500'
    },
    {
      id: 'merchant',
      title: 'Merchant',
      description: 'Manage your shop or restaurant and sell products.',
      icon: Store,
      color: 'bg-emerald-600',
      hoverColor: 'hover:bg-emerald-500'
    },
    {
      id: 'admin',
      title: 'Station Admin',
      description: 'Manage your station and fulfill incoming orders.',
      icon: Shield,
      color: 'bg-stone-900',
      hoverColor: 'hover:bg-black'
    }
  ];

  const handleSelect = (id: string) => {
    navigate(`/signup/${id}`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
      {/* Animated Blurred Background */}
      <div className="absolute inset-0 bg-stone-900">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-600/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/30 rounded-full blur-[120px] animate-pulse delay-700"></div>
      </div>

      {/* Back Button */}
      <button 
        onClick={() => navigate('/login')}
        className="absolute top-8 left-8 text-white/60 hover:text-white flex items-center gap-2 transition-colors z-10"
      >
        <ChevronLeft size={20} />
        <span className="font-bold uppercase tracking-widest text-xs">Back to Login</span>
      </button>

      <div className="relative w-full max-w-[400px] px-6 space-y-8">
        <div className="text-center space-y-2">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl font-black text-white tracking-tighter italic uppercase"
          >
            Choose Your <span className="text-accent">Role</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/40 font-medium"
          >
            Select how you want to use Flash Delivery
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {categories.map((cat, i) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * (i + 1) }}
              onClick={() => handleSelect(cat.id)}
              className="group relative flex items-center gap-6 p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all text-left overflow-hidden"
            >
              <div className={`w-16 h-16 ${cat.color} rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                <cat.icon size={32} />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="text-xl font-black text-white uppercase tracking-tight italic">{cat.title}</h3>
                <p className="text-sm text-white/40 font-medium leading-relaxed">{cat.description}</p>
              </div>
              <ArrowRight className="text-white/20 group-hover:text-primary group-hover:translate-x-2 transition-all" size={24} />
              
              {/* Decorative accent */}
              <div className={`absolute top-0 right-0 w-1 h-full ${cat.color} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
