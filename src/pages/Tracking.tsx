import React, { useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { MapPin, Truck, Phone, MessageSquare, Clock, CheckCircle, AlertTriangle, ChevronLeft } from 'lucide-react';
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
  const navigate = useNavigate();
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
    phone: '+233 24 123 4567',
    vehicle: 'Ford F-150 (White)',
    plate: 'GAS-2024',
    rating: 4.9,
    eta: order.status === 'in-transit' ? '12 mins' : 'Calculating...'
  };

  return (
    <div className="min-h-screen bg-white pb-12">
      {/* Uber Eats Style Tracking Header */}
      <header className="px-6 py-6 border-b border-stone-100 flex items-center justify-between bg-white sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-black hover:bg-stone-100 p-2 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-black">Order Status</h1>
        </div>
        <button className="text-sm font-bold text-black hover:underline">Help</button>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Map & Status */}
        <div className="lg:col-span-2 space-y-8">
          {/* Status Message */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-black tracking-tight">
              {order.status === 'pending' && 'Confirming your order...'}
              {order.status === 'confirmed' && 'Preparing your order...'}
              {order.status === 'in-transit' && 'Your rider is on the way'}
              {order.status === 'delivered' && 'Order delivered'}
            </h2>
            <p className="text-stone-500 font-medium">
              Estimated arrival: <span className="text-black font-bold">{rider.eta}</span>
            </p>
          </div>

          {/* Progress Bar */}
          <div className="relative h-1 bg-stone-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${((displayStepIndex + 1) / STEPS.length) * 100}%` }}
              className="absolute top-0 left-0 h-full bg-uber-green"
            />
          </div>

          {/* Map View */}
          <div className="bg-stone-100 rounded-xl overflow-hidden shadow-sm h-[400px] relative border border-stone-200">
            <img 
              src="https://picsum.photos/seed/tracking/1200/800" 
              alt="Tracking Map" 
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 flex items-center justify-center">
               <motion.div 
                 animate={{ scale: [1, 1.1, 1] }}
                 transition={{ repeat: Infinity, duration: 2 }}
                 className="bg-black p-4 rounded-full shadow-2xl text-white"
               >
                 <Truck size={32} />
               </motion.div>
            </div>
          </div>

          {/* Status Steps List */}
          <div className="space-y-6">
            {STEPS.map((step, i) => {
              const isCompleted = displayStepIndex > i;
              const isActive = displayStepIndex === i;
              const isPending = displayStepIndex < i;

              return (
                <div key={step.id} className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                    isCompleted ? "bg-uber-green text-white" : 
                    isActive ? "bg-black text-white" : "bg-stone-100 text-stone-400"
                  )}>
                    {isCompleted ? <CheckCircle size={20} /> : <step.icon size={20} />}
                  </div>
                  <div className="flex-1">
                    <p className={cn(
                      "font-bold",
                      isPending ? "text-stone-400" : "text-black"
                    )}>
                      {step.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Rider & Order Info */}
        <div className="space-y-6">
          {/* Rider Card */}
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-stone-100 overflow-hidden border border-stone-200">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Michael" alt="rider" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-black">{rider.name}</h3>
                  <p className="text-sm text-stone-500 font-medium">{rider.vehicle}</p>
                </div>
              </div>
              <div className="bg-stone-100 px-2 py-1 rounded text-xs font-bold text-black">
                ★ {rider.rating}
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 bg-stone-100 hover:bg-stone-200 text-black p-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all">
                <Phone size={20} /> Call
              </button>
              <button className="flex-1 bg-stone-100 hover:bg-stone-200 text-black p-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all">
                <MessageSquare size={20} /> Message
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
            <h4 className="text-lg font-bold text-black">Order details</h4>
            <div className="space-y-3">
              {order.items ? (
                order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start text-sm">
                    <div className="text-stone-600 font-medium">
                      <span>{item.name}</span>
                      {item.type === 'fuel' && (
                        <span className="text-[10px] block opacity-60 italic">≈ {item.quantity.toFixed(2)} Litres</span>
                      )}
                    </div>
                    <span className="text-black font-bold">GH₵{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-600 font-medium">Amount</span>
                    <span className="text-black font-bold">GH₵{order.totalPrice.toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="h-px bg-stone-100 my-2"></div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-600 font-medium">Total</span>
                <span className="text-black font-bold text-lg">GH₵{order.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
