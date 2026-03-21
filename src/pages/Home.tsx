import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { Fuel, Clock, Shield, MapPin, ArrowRight, Star, Search, Filter, Zap, ShoppingBag, Truck } from 'lucide-react';
import { Station, User } from '../types';

const MOCK_STATIONS: Station[] = [
  {
    id: 'station-1',
    name: 'Flash Hub Central',
    address: '123 Main St, Downtown',
    rating: 4.9,
    deliveryTime: '15-25 min',
    deliveryFee: 2.99,
    imageUrl: 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=800',
    categories: ['Fuel'],
    isFeatured: true
  },
  {
    id: 'station-2',
    name: 'Rapid Refuel North',
    address: '456 Park Ave, Northside',
    rating: 4.7,
    deliveryTime: '20-35 min',
    deliveryFee: 3.99,
    imageUrl: 'https://images.unsplash.com/photo-1527018601619-a508a2be00cd?auto=format&fit=crop&q=80&w=800',
    categories: ['Fuel', 'Additives']
  },
  {
    id: 'station-3',
    name: 'EcoGas Express',
    address: '789 Green Way, West End',
    rating: 4.8,
    deliveryTime: '25-40 min',
    deliveryFee: 1.99,
    imageUrl: 'https://images.unsplash.com/photo-1563906267088-b029e7101114?auto=format&fit=crop&q=80&w=800',
    categories: ['Fuel', 'Emergency']
  }
];

const CATEGORIES = [
  { name: 'Fuel', icon: Fuel, color: 'bg-orange-100 text-orange-600' },
  { name: 'Emergency', icon: Clock, color: 'bg-red-100 text-red-600' }
];

interface HomeProps {
  user: User | null;
}

export default function Home({ user }: HomeProps) {
  const navigate = useNavigate();
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (user) return null;

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Section - Uber Eats Style */}
      <section className="relative h-[600px] -mx-4 sm:-mx-8 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=1920" 
            alt="Hero Background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-primary/60"></div>
        </div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 w-full"
          >
            <h1 className="text-4xl sm:text-6xl font-bold text-white leading-tight tracking-tight">
              Order fuel delivery to your door
            </h1>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/order')}
                className="bg-primary text-white px-12 py-5 rounded-2xl font-black text-xl hover:bg-primary/90 transition-all active:scale-95 shadow-2xl uppercase tracking-widest italic"
              >
                Order Now
              </button>
            </div>
            
            <p className="text-white font-medium">
              <Link to="/login" className="underline hover:text-stone-200">Sign In</Link> for your recent addresses
            </p>
          </motion.div>
        </div>
      </section>

      {/* Categories - Uber Eats Style */}
      <section className="space-y-6 py-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-black">Explore by category</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <button 
              key={cat.name}
              onClick={() => navigate('/order', { state: { category: cat.name } })}
              className="flex flex-col items-center gap-3 p-4 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors group"
            >
              <div className={`w-12 h-12 ${cat.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <cat.icon size={24} />
              </div>
              <span className="text-sm font-bold text-black">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* How it Works - Bolt Style */}
      <section className="bg-stone-100 -mx-4 sm:-mx-8 px-4 sm:px-8 py-12 rounded-[4rem]">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl sm:text-5xl font-black text-stone-900 tracking-tighter uppercase italic">Refuel in 3 steps</h2>
            <p className="text-stone-500 font-medium max-w-md mx-auto">Refueling has never been this easy. Just a few taps and we're on our way.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: MapPin, title: 'Set Location', desc: 'Enter your address and we will find the nearest station.' },
              { icon: Fuel, title: 'Choose Amount', desc: 'Select fuel type and enter the amount you need.' },
              { icon: Truck, title: 'Fast Delivery', desc: 'Our rider arrives in minutes to refuel your gas.' }
            ].map((step, i) => (
              <div key={i} className="text-center space-y-6 group">
                <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-transform duration-500">
                  <step.icon size={40} className="text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-stone-900 uppercase italic tracking-tight">{step.title}</h3>
                  <p className="text-sm text-stone-500 font-medium leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Promo - Bolt Style */}
      <section className="relative bg-primary rounded-[4rem] p-8 sm:p-12 overflow-hidden group">
        <div className="relative z-10 max-w-xl space-y-8">
          <h2 className="text-4xl sm:text-6xl font-black text-white leading-[0.9] tracking-tighter uppercase italic">
            Refuel anywhere <br />
            <span className="text-accent">with our app</span>
          </h2>
          <p className="text-white/80 text-lg font-medium max-w-md">
            Download the Flash Delivery app for the best experience and exclusive offers.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="bg-stone-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-black transition-all shadow-xl">
              App Store
            </button>
            <button className="bg-stone-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-black transition-all shadow-xl">
              Google Play
            </button>
          </div>
        </div>
        
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-white/10 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000"></div>
        <Zap className="absolute -right-10 -bottom-10 text-white/5 w-80 h-80 -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
      </section>

      {/* Become a Partner - Bolt Style */}
      <section className="grid grid-cols-1 max-w-2xl mx-auto">
        <div className="bg-white border border-stone-200 rounded-[3rem] p-10 space-y-6 hover:shadow-xl transition-all group">
          <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-900 group-hover:bg-primary group-hover:text-white transition-colors">
            <Truck size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-stone-900 uppercase italic tracking-tight">Become a Rider</h3>
            <p className="text-stone-500 font-medium">Earn money on your own schedule. Deliver fuel and help people stay on the move.</p>
          </div>
          <button 
            onClick={() => navigate('/signup/rider')}
            className="text-primary font-black text-sm uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all"
          >
            Apply Now <ArrowRight size={18} />
          </button>
        </div>
      </section>
    </div>
  );
}
