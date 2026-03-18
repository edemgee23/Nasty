import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { MapPin, Truck, Phone, MessageSquare, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { db, doc, onSnapshot, OperationType, handleFirestoreError } from '../firebase';
import { User, Order as AppOrder } from '../types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const STEPS = [
  { id: 'pending', label: 'Confirmed', icon: CheckCircle },
  { id: 'confirmed', label: 'Preparing', icon: Clock },
  { id: 'in-transit', label: 'In Transit', icon: Truck },
  { id: 'delivered', label: 'Delivered', icon: MapPin },
];

interface TrackingProps {
  user: User | null;
}

export default function Tracking({ user }: TrackingProps) {
  const { orderId } = useParams();
  const [order, setOrder] = useState<AppOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId || !user) return;

    const unsubscribe = onSnapshot(
      doc(db, 'orders', orderId),
      (doc) => {
        if (doc.exists()) {
          setOrder({ id: doc.id, ...doc.data() } as AppOrder);
          setError(null);
        } else {
          setError('Order not found');
        }
        setLoading(false);
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, `orders/${orderId}`);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [orderId, user]);

  if (!user) return <Navigate to="/" />;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-stone-900">{error || 'Something went wrong'}</h2>
        <p className="text-stone-500">We couldn't find the order you're looking for.</p>
      </div>
    );
  }

  const currentStepIndex = STEPS.findIndex(s => s.id === order.status);
  const displayStepIndex = currentStepIndex === -1 ? 0 : currentStepIndex;

  // Mock rider data (in a real app, this would be fetched from a riders collection)
  const rider = {
    name: 'Michael Scott',
    phone: '+1 (555) 123-4567',
    vehicle: 'Ford F-150 (White)',
    plate: 'GAS-2024',
    rating: 4.9,
    eta: order.status === 'in-transit' ? '12 mins' : 'Calculating...'
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Map & Status */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm h-[400px] relative">
          <img 
            src="https://picsum.photos/seed/tracking/1200/800" 
            alt="Tracking Map" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 flex items-center justify-center">
             <motion.div 
               animate={{ y: [0, -10, 0] }}
               transition={{ repeat: Infinity, duration: 2 }}
               className="bg-primary p-3 rounded-full shadow-xl shadow-primary/40 text-white"
             >
               <Truck size={32} />
             </motion.div>
          </div>
          
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 shadow-lg">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Order ID</p>
              <p className="text-sm font-black text-stone-900">#{orderId?.slice(0, 8).toUpperCase() || 'GAS-8921'}</p>
            </div>
            <div className="bg-primary px-4 py-2 rounded-2xl shadow-lg text-white text-center">
              <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">ETA</p>
              <p className="text-lg font-black">{rider.eta}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm relative overflow-hidden">
          {/* Progress Bar Background */}
          <div className="absolute top-12 left-12 right-12 h-1 bg-stone-100 rounded-full hidden sm:block" />
          
          {/* Active Progress Bar */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(displayStepIndex / (STEPS.length - 1)) * 100}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute top-12 left-12 h-1 bg-primary rounded-full hidden sm:block origin-left"
          />

          <div className="relative flex justify-between items-start">
            {STEPS.map((step, i) => {
              const isCompleted = displayStepIndex > i;
              const isActive = displayStepIndex === i;
              const isPending = displayStepIndex < i;

              return (
                <div key={step.id} className="flex flex-col items-center gap-3 relative z-10 flex-1">
                  <motion.div 
                    initial={false}
                    animate={{ 
                      scale: isActive ? 1.2 : 1,
                      backgroundColor: isCompleted || isActive ? '#FF4444' : '#F5F5F4',
                      color: isCompleted || isActive ? '#FFFFFF' : '#A8A29E'
                    }}
                    className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm",
                      isActive && "shadow-lg shadow-primary/40 ring-4 ring-primary/20"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle size={24} />
                    ) : (
                      <step.icon size={24} className={cn(isActive && "animate-pulse")} />
                    )}
                  </motion.div>
                  
                  <div className="text-center space-y-1">
                    <p className={cn(
                      "text-[10px] font-black uppercase tracking-widest leading-none",
                      isPending ? "text-stone-400" : "text-stone-900"
                    )}>
                      {step.label}
                    </p>
                    {isActive && (
                      <motion.span 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[9px] font-bold text-primary uppercase tracking-tighter"
                      >
                        In Progress
                      </motion.span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-10 bg-stone-50 rounded-2xl p-5 flex items-center gap-5 border border-stone-100">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm border border-stone-100">
              <Clock size={24} className="animate-spin-slow" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-black text-stone-900 uppercase tracking-widest italic">Current Stage</span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              </div>
              <p className="text-sm font-bold text-stone-700 leading-tight">
                {order.status === 'pending' && 'Your order is being processed by our system.'}
                {order.status === 'confirmed' && 'A rider has accepted your request and is preparing.'}
                {order.status === 'in-transit' && 'The delivery vehicle is currently on its way to your location.'}
                {order.status === 'delivered' && 'Delivery completed successfully. Thank you for using Flash!'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Rider Info */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-stone-100 overflow-hidden border border-stone-200">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Michael" alt="rider" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900">{rider.name}</h3>
              <div className="flex items-center gap-1 text-accent">
                <span className="text-sm font-black">★</span>
                <span className="text-xs font-bold text-stone-600">{rider.rating} Rating</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Vehicle</p>
              <p className="text-xs font-bold text-stone-900">{rider.vehicle}</p>
            </div>
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Plate</p>
              <p className="text-xs font-bold text-stone-900">{rider.plate}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex-1 bg-primary hover:bg-primary/90 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all">
              <Phone size={20} /> Call
            </button>
            <button className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-600 p-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all">
              <MessageSquare size={20} /> Chat
            </button>
          </div>
        </div>

        <div className="bg-stone-900 p-6 rounded-3xl text-white space-y-4">
          <h4 className="text-sm font-black uppercase tracking-widest italic">Order Details</h4>
          <div className="space-y-3">
            {order.items ? (
              order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-sm">
                  <div className="opacity-70 font-bold">
                    <span>{item.quantity}x {item.name}</span>
                  </div>
                  <span className="text-white font-black">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))
            ) : (
              <>
                <div className="flex justify-between text-sm">
                  <span className="opacity-70 font-bold">Fuel Type</span>
                  <span className="text-white font-black">{order.gasType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-70 font-bold">Amount</span>
                  <span className="text-white font-black">{order.amount} Gallons</span>
                </div>
              </>
            )}
            <div className="h-px bg-white/10 my-2"></div>
            <div className="flex justify-between text-sm">
              <span className="opacity-70 font-bold">Delivery Address</span>
              <span className="text-white font-black text-right max-w-[150px]">{order.location.address}</span>
            </div>
          </div>
          <div className="h-px bg-white/10"></div>
          <div className="flex justify-between items-center">
            <span className="font-black uppercase tracking-widest text-xs">Total Paid</span>
            <span className="text-2xl font-black text-accent italic">${order.totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
