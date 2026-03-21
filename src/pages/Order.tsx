import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { MapPin, Fuel, CreditCard, ChevronRight, AlertCircle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { db, collection, addDoc, OperationType, handleFirestoreError } from '../firebase';
import { User, Order as AppOrder, CartItem } from '../types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DEFAULT_GAS = { id: 'fuel', name: 'Fuel', price: 14.85 };

interface OrderProps {
  user: User | null;
}

export default function Order({ user }: OrderProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [location, setLocation] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default to a fuel order setup
  const [selectedGas] = useState(DEFAULT_GAS);
  const [ghcAmount, setGhcAmount] = useState(100);

  const handleLocate = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
          setIsLocating(false);
        },
        () => {
          setIsLocating(false);
          alert('Could not get your location. Please enter it manually.');
        }
      );
    }
  };

  const subtotal = ghcAmount;
  const litres = ghcAmount / selectedGas.price;

  const deliveryFee = 15.00;
  const total = subtotal + deliveryFee;

  const handleSubmitOrder = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      const items = [{
        id: selectedGas.id,
        name: selectedGas.name,
        price: selectedGas.price,
        quantity: litres,
        type: 'fuel' as const
      }];

      const orderData: Omit<AppOrder, 'id'> = {
        customerId: user.uid,
        customerName: user.displayName || 'Anonymous',
        customerPhone: user.phoneNumber || '',
        status: 'pending',
        location: {
          lat: 0,
          lng: 0,
          address: location
        },
        items,
        totalPrice: total,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        stationId: 'default-hub',
        stationName: 'Flash Delivery Hub'
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      navigate(`/tracking/${docRef.id}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'orders');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-8 pb-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-stone-900 tracking-tighter italic uppercase">Checkout</h1>
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={cn(
                "w-8 h-2 rounded-full transition-all",
                step >= s ? "bg-primary" : "bg-stone-200"
              )}
            />
          ))}
        </div>
      </div>

      {step === 1 && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="space-y-4">
            <label className="block text-xs font-black text-stone-400 uppercase tracking-widest">Delivery Address</label>
            <div className="relative">
              <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter address or pin location"
                className="w-full bg-white border border-stone-200 rounded-2xl px-12 py-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-bold"
              />
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
              <button 
                onClick={handleLocate}
                disabled={isLocating}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-primary font-black text-xs uppercase tracking-widest hover:text-primary/80"
              >
                {isLocating ? 'Locating...' : 'Use Current'}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-stone-400 uppercase tracking-widest">Amount (GH₵)</span>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  min="1" 
                  value={ghcAmount} 
                  onChange={(e) => setGhcAmount(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-32 bg-stone-100 border-none rounded-xl px-3 py-2 text-right font-black text-primary outline-none focus:ring-2 focus:ring-primary transition-all"
                />
                <span className="font-black text-stone-900">GH₵</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-[10px] text-stone-400 font-medium">Enter the amount of money you want to spend.</p>
              <p className="text-[10px] font-black text-primary uppercase tracking-widest italic">≈ {litres.toFixed(2)} L</p>
            </div>
          </div>

          <div className="bg-stone-50 rounded-3xl border border-stone-200 overflow-hidden">
            <div className="p-4 flex justify-between items-center">
              <span className="text-xs font-black text-stone-400 uppercase tracking-widest">Subtotal</span>
              <span className="font-black text-stone-900">GH₵{subtotal.toFixed(2)}</span>
            </div>
            <div className="p-4 border-t border-stone-100 flex justify-between items-center">
              <span className="text-xs font-black text-stone-400 uppercase tracking-widest">Delivery Fee</span>
              <span className="font-black text-stone-900">GH₵{deliveryFee.toFixed(2)}</span>
            </div>
            <div className="p-4 bg-primary/5 border-t border-stone-100 flex justify-between items-center">
              <span className="text-sm font-black text-stone-900 uppercase tracking-widest">Estimated Total</span>
              <span className="text-xl font-black text-primary italic">GH₵{total.toFixed(2)}</span>
            </div>
          </div>

          <button 
            onClick={() => setStep(2)}
            disabled={!location || !selectedGas}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-stone-300 text-white py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
          >
            Continue to Payment <ChevronRight size={20} />
          </button>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div className="bg-stone-900 rounded-3xl p-8 text-white space-y-6">
            <h3 className="text-xl font-black italic tracking-tighter uppercase">Order Total</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm opacity-60 font-bold">
                <span>Items Subtotal</span>
                <span>GH₵{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm opacity-60 font-bold">
                <span>Delivery Fee</span>
                <span>GH₵{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="h-px bg-white/10 my-2"></div>
              <div className="flex justify-between items-center">
                <span className="font-black uppercase tracking-widest text-sm">Total Amount</span>
                <span className="text-3xl font-black text-accent italic">GH₵{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6 text-center">
            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center text-primary mx-auto">
              <CreditCard size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-stone-900 tracking-tight uppercase">Secure Payment</h2>
              <p className="text-stone-500 font-medium">Complete your order with Stripe</p>
            </div>
            
            <div className="p-4 bg-accent/10 border border-accent/20 rounded-2xl flex gap-3 text-left">
              <AlertCircle className="text-accent shrink-0" size={20} />
              <p className="text-xs text-stone-700 leading-relaxed font-medium">
                This is a demo application. No real payment will be processed. 
                Clicking confirm will simulate a successful transaction.
              </p>
            </div>

            <button 
              onClick={handleSubmitOrder}
              disabled={isSubmitting}
              className="w-full bg-stone-900 hover:bg-black disabled:bg-stone-400 text-white py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                `Confirm & Pay GH₵${total.toFixed(2)}`
              )}
            </button>
            
            <button 
              onClick={() => setStep(1)}
              className="w-full text-stone-400 font-black text-xs uppercase tracking-widest hover:text-stone-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
