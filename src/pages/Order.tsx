import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { MapPin, Fuel, CreditCard, CheckCircle, AlertCircle, ChevronRight, ShoppingBag, Trash2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { db, collection, addDoc, OperationType, handleFirestoreError } from '../firebase';
import { User, Order as AppOrder, CartItem } from '../types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const GAS_TYPES = [
  { id: 'regular', name: 'Regular (87)', price: 3.45 },
  { id: 'premium', name: 'Premium (93)', price: 4.12 },
  { id: 'diesel', name: 'Diesel', price: 3.89 },
];

interface OrderProps {
  user: User | null;
}

export default function Order({ user }: OrderProps) {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const [step, setStep] = useState(1);
  const [cart, setCart] = useState<CartItem[]>(routerLocation.state?.cart || []);
  const [location, setLocation] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If no cart, default to a quick fuel order setup
  const [selectedGas, setSelectedGas] = useState(GAS_TYPES[0]);
  const [amount, setAmount] = useState(10);

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

  const subtotal = cart.length > 0 
    ? cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    : amount * selectedGas.price;

  const deliveryFee = 5.00;
  const total = subtotal + deliveryFee;

  const handleSubmitOrder = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      const items = cart.length > 0 ? cart : [{
        id: selectedGas.id,
        name: selectedGas.name,
        price: selectedGas.price,
        quantity: amount,
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
        stationId: cart[0]?.stationId || 'default-hub',
        stationName: cart[0]?.stationId ? 'Flash Hub Central' : 'Flash Delivery Hub'
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      navigate(`/tracking/${docRef.id}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'orders');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeItem = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
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
            <label className="block text-xs font-black text-stone-400 uppercase tracking-widest">Order Summary</label>
            <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden">
              {cart.length > 0 ? (
                <div className="divide-y divide-stone-100">
                  {cart.map((item) => (
                    <div key={item.id} className="p-4 flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-stone-50 rounded-lg flex items-center justify-center text-stone-600 font-black text-xs">
                          {item.quantity}x
                        </div>
                        <div>
                          <p className="font-bold text-stone-900">{item.name}</p>
                          <p className="text-xs text-stone-500">${item.price.toFixed(2)} each</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-black text-stone-900">${(item.price * item.quantity).toFixed(2)}</span>
                        <button onClick={() => removeItem(item.id)} className="text-stone-300 hover:text-red-500 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-3 text-stone-500">
                    <ShoppingBag size={20} />
                    <p className="text-sm font-bold">Quick Fuel Order (No items in cart)</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {GAS_TYPES.map((gas) => (
                      <button
                        key={gas.id}
                        onClick={() => setSelectedGas(gas)}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-2xl border-2 transition-all",
                          selectedGas.id === gas.id ? "border-primary bg-primary/5" : "border-stone-100"
                        )}
                      >
                        <span className="font-bold">{gas.name}</span>
                        <span className="text-xs font-bold text-stone-500">${gas.price}/gal</span>
                      </button>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-xs font-black text-stone-400 uppercase tracking-widest">Amount</span>
                      <span className="font-black text-primary">{amount} gal</span>
                    </div>
                    <input 
                      type="range" min="5" max="30" value={amount} 
                      onChange={(e) => setAmount(parseInt(e.target.value))}
                      className="w-full h-2 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={() => setStep(2)}
            disabled={!location || (cart.length === 0 && !selectedGas)}
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
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm opacity-60 font-bold">
                <span>Delivery Fee</span>
                <span>${deliveryFee.toFixed(2)}</span>
              </div>
              <div className="h-px bg-white/10 my-2"></div>
              <div className="flex justify-between items-center">
                <span className="font-black uppercase tracking-widest text-sm">Total Amount</span>
                <span className="text-3xl font-black text-accent italic">${total.toFixed(2)}</span>
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
                `Confirm & Pay $${total.toFixed(2)}`
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
