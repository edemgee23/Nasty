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
  { name: 'Additives', icon: Star, color: 'bg-purple-100 text-purple-600' },
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
    <div className="space-y-12 pb-20">
      {/* Hero Section - Bolt Style */}
      <section className="relative -mx-4 sm:-mx-8 px-4 sm:px-8 py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-stone-900">
          <img 
            src="https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=1920" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-30 grayscale"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-900/60 via-stone-900/80 to-stone-900"></div>
        </div>

        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="text-4xl sm:text-7xl font-black text-white leading-[0.9] tracking-tighter uppercase italic">
              Fuel delivered <br />
              <span className="text-primary">to your door</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/60 font-medium max-w-lg mx-auto">
              The fastest way to refuel your vehicle without leaving your home or office.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-2 bg-white p-2 rounded-[2rem] shadow-2xl max-w-xl mx-auto"
          >
            <div className="flex-1 relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
              <input 
                type="text" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter delivery address" 
                className="w-full bg-transparent border-none rounded-2xl pl-12 pr-4 py-4 font-bold text-stone-900 outline-none placeholder:text-stone-300"
              />
            </div>
            <button 
              onClick={() => navigate('/order')}
              className="bg-primary text-white px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20"
            >
              Search
            </button>
          </motion.div>
        </div>
      </section>

      {/* Categories - Bolt Style */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black text-stone-900 tracking-tight uppercase italic">Categories</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button 
              key={cat.name}
              onClick={() => navigate('/order', { state: { category: cat.name } })}
              className="flex flex-col items-center gap-3 min-w-[120px] group"
            >
              <div className={`w-20 h-20 ${cat.color} rounded-[2rem] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                <cat.icon size={32} />
              </div>
              <span className="text-sm font-black text-stone-900 uppercase tracking-tight">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Stations - Bolt Style */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-stone-900 tracking-tight uppercase italic">Popular Near You</h2>
          <Link to="/order" className="text-primary font-black text-sm flex items-center gap-1 hover:underline uppercase tracking-widest">
            View all <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {MOCK_STATIONS.map((station, i) => (
            <motion.div 
              key={station.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <Link to={`/station/${station.id}`} className="block space-y-4">
                <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-xl">
                  <img 
                    src={station.imageUrl} 
                    alt={station.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {station.isFeatured && (
                    <div className="absolute top-6 left-6 bg-accent text-stone-900 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                      Top Rated
                    </div>
                  )}
                  
                  <div className="absolute bottom-6 left-6 bg-white px-4 py-2 rounded-2xl shadow-xl">
                    <div className="flex items-center gap-2">
                      <Star size={14} className="text-accent fill-accent" />
                      <span className="text-sm font-black text-stone-900">{station.rating}</span>
                    </div>
                  </div>

                  <div className="absolute bottom-6 right-6 bg-stone-900/80 backdrop-blur-md text-white px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl">
                    {station.deliveryTime}
                  </div>
                </div>

                <div className="px-2 space-y-1">
                  <h3 className="text-xl font-black text-stone-900 tracking-tight uppercase italic">{station.name}</h3>
                  <div className="flex items-center gap-3 text-stone-500 font-bold text-sm">
                    <span>{station.categories.join(', ')}</span>
                    <span className="w-1 h-1 bg-stone-300 rounded-full"></span>
                    <span className="text-primary">${station.deliveryFee} delivery</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works - Bolt Style */}
      <section className="bg-stone-100 -mx-4 sm:-mx-8 px-4 sm:px-8 py-20 rounded-[4rem]">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl sm:text-5xl font-black text-stone-900 tracking-tighter uppercase italic">Refuel in 3 steps</h2>
            <p className="text-stone-500 font-medium max-w-md mx-auto">Refueling has never been this easy. Just a few taps and we're on our way.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: MapPin, title: 'Set Location', desc: 'Enter your address and we will find the nearest station.' },
              { icon: ShoppingBag, title: 'Choose Service', desc: 'Select fuel type or other services you need.' },
              { icon: Truck, title: 'Fast Delivery', desc: 'Our rider arrives in minutes to refuel your vehicle.' }
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
      <section className="relative bg-primary rounded-[4rem] p-10 sm:p-20 overflow-hidden group">
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
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

        <div className="bg-white border border-stone-200 rounded-[3rem] p-10 space-y-6 hover:shadow-xl transition-all group">
          <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-900 group-hover:bg-accent group-hover:text-stone-900 transition-colors">
            <Shield size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-stone-900 uppercase italic tracking-tight">Partner with us</h3>
            <p className="text-stone-500 font-medium">Grow your station business by reaching thousands of customers through our platform.</p>
          </div>
          <button 
            onClick={() => navigate('/signup/merchant')}
            className="text-primary font-black text-sm uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all"
          >
            Register Station <ArrowRight size={18} />
          </button>
        </div>
      </section>
    </div>
  );
}
