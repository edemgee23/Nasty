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
    }
  ];

  const handleSelect = (id: string) => {
    navigate(`/signup/${id}`);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="px-6 py-6 flex items-center">
        <button 
          onClick={() => navigate('/login')}
          className="text-black hover:bg-stone-100 p-2 rounded-full transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 pb-12">
        <div className="w-full max-w-[440px] space-y-10">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-black tracking-tight">How would you like to use Flash?</h1>
            <p className="text-stone-500 font-medium">Choose the role that best fits your needs.</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {categories.map((cat, i) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                onClick={() => handleSelect(cat.id)}
                className="group flex items-center gap-6 p-6 bg-stone-50 rounded-xl hover:bg-stone-100 transition-all text-left border border-transparent hover:border-stone-200"
              >
                <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center text-black shadow-sm group-hover:scale-105 transition-transform">
                  <cat.icon size={28} />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="text-lg font-bold text-black tracking-tight">{cat.title}</h3>
                  <p className="text-sm text-stone-500 font-medium leading-relaxed">{cat.description}</p>
                </div>
                <ArrowRight className="text-stone-300 group-hover:text-black group-hover:translate-x-1 transition-all" size={20} />
              </motion.button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
