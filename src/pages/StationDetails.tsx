import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Fuel, Shield, Star, Clock, ShoppingCart, Plus, Minus, ChevronLeft, Info } from 'lucide-react';
import { Service, CartItem } from '../types';

const MOCK_SERVICES: Service[] = [
  { id: 's1', stationId: 'station-1', name: 'Regular 87', description: 'Standard fuel for most vehicles.', price: 3.45, imageUrl: 'https://images.unsplash.com/photo-1527018601619-a508a2be00cd?auto=format&fit=crop&q=80&w=400', category: 'Fuel' },
  { id: 's2', stationId: 'station-1', name: 'Premium 93', description: 'High-performance fuel for luxury cars.', price: 4.12, imageUrl: 'https://images.unsplash.com/photo-1527018601619-a508a2be00cd?auto=format&fit=crop&q=80&w=400', category: 'Fuel' },
  { id: 's3', stationId: 'station-1', name: 'Diesel', description: 'Efficient fuel for diesel engines.', price: 3.89, imageUrl: 'https://images.unsplash.com/photo-1527018601619-a508a2be00cd?auto=format&fit=crop&q=80&w=400', category: 'Fuel' },
  { id: 's6', stationId: 'station-1', name: 'Fuel Injector Cleaner', description: 'Improves engine performance.', price: 12.99, imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&q=80&w=400', category: 'Additives' },
];

export default function StationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(MOCK_SERVICES.map(s => s.category)))];

  const addToCart = (service: Service) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === service.id);
      if (existing) {
        return prev.map(item => item.id === service.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { id: service.id, name: service.name, price: service.price, quantity: 1, type: service.category === 'Fuel' ? 'fuel' : 'service', stationId: service.stationId }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === id);
      if (existing && existing.quantity > 1) {
        return prev.map(item => item.id === id ? { ...item, quantity: item.quantity - 1 } : item);
      }
      return prev.filter(item => item.id !== id);
    });
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const filteredServices = selectedCategory === 'All' 
    ? MOCK_SERVICES 
    : MOCK_SERVICES.filter(s => s.category === selectedCategory);

  return (
    <div className="space-y-8 pb-32">
      {/* Header */}
      <div className="relative h-64 -mx-4 sm:-mx-8 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=1920" 
          alt="Station" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent"></div>
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-stone-900 tracking-tighter italic uppercase">Flash Hub Central</h1>
            <div className="flex items-center gap-4 text-sm font-bold text-stone-500">
              <div className="flex items-center gap-1">
                <Star size={16} className="text-accent fill-accent" />
                <span className="text-stone-900">4.9</span>
                <span>(500+ ratings)</span>
              </div>
              <span>•</span>
              <span>Fuel & Services</span>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="bg-stone-100 p-3 rounded-2xl flex flex-col items-center min-w-[80px]">
              <Clock size={20} className="text-stone-600 mb-1" />
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Time</span>
              <span className="text-xs font-bold text-stone-900">20 min</span>
            </div>
            <div className="bg-stone-100 p-3 rounded-2xl flex flex-col items-center min-w-[80px]">
              <Info size={20} className="text-stone-600 mb-1" />
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Fee</span>
              <span className="text-xs font-bold text-stone-900">$2.99</span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-stone-100">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all",
                selectedCategory === cat 
                  ? "bg-stone-900 text-white" 
                  : "bg-stone-100 text-stone-500 hover:bg-stone-200"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredServices.map((service) => {
            const cartItem = cart.find(item => item.id === service.id);
            return (
              <div key={service.id} className="flex gap-4 p-4 bg-white rounded-3xl border border-stone-100 shadow-sm hover:shadow-md transition-all group">
                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-black text-stone-900 tracking-tight">{service.name}</h3>
                  <p className="text-sm text-stone-500 line-clamp-2 leading-relaxed">{service.description}</p>
                  <p className="text-lg font-black text-primary">${service.price.toFixed(2)}</p>
                </div>
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shrink-0">
                  <img 
                    src={service.imageUrl} 
                    alt={service.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-2 right-2">
                    {cartItem ? (
                      <div className="bg-white rounded-full shadow-xl flex items-center gap-3 px-2 py-1 border border-stone-100">
                        <button 
                          onClick={() => removeFromCart(service.id)}
                          className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-stone-200"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-black text-stone-900">{cartItem.quantity}</span>
                        <button 
                          onClick={() => addToCart(service)}
                          className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary/90"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => addToCart(service)}
                        className="w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center text-primary hover:scale-110 transition-transform border border-stone-100"
                      >
                        <Plus size={24} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-8 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-[400px] z-50"
        >
          <button 
            onClick={() => navigate('/order', { state: { cart } })}
            className="w-full bg-primary text-white p-4 rounded-2xl shadow-2xl shadow-primary/40 flex items-center justify-between group hover:scale-[1.02] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-black">
                {totalItems}
              </div>
              <span className="font-black uppercase tracking-widest text-sm">View Cart</span>
            </div>
            <span className="font-black text-lg">${totalPrice.toFixed(2)}</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
