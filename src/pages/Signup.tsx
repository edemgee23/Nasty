import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Camera, Upload, CheckCircle2, X, Chrome } from 'lucide-react';
import { auth, createUserWithEmailAndPassword, db, doc, setDoc, OperationType, handleFirestoreError, storage, ref, uploadString, getDownloadURL, signInWithPopup, GoogleAuthProvider, getDoc } from '../firebase';
import { User } from '../types';

export default function Signup() {
  const navigate = useNavigate();
  const { role } = useParams<{ role: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ghanaCardFront, setGhanaCardFront] = useState<string | null>(null);
  const [ghanaCardBack, setGhanaCardBack] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (side === 'front') setGhanaCardFront(reader.result as string);
        else setGhanaCardBack(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (base64: string, path: string) => {
    const storageRef = ref(storage, path);
    await uploadString(storageRef, base64, 'data_url');
    return await getDownloadURL(storageRef);
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user already exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        navigate('/dashboard');
        return;
      }

      // Create new user with the selected role
      const newUser: User = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || displayName || 'Flash User',
        phoneNumber: user.phoneNumber || null,
        role: (role as 'customer' | 'rider' | 'admin' | 'merchant') || 'customer',
        isOnline: false,
      };

      await setDoc(doc(db, 'users', user.uid), newUser);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!agree) {
      setError("You must agree to the terms and conditions");
      return;
    }
    if (role === 'rider' && (!ghanaCardFront || !ghanaCardBack)) {
      setError("Please upload both front and back of your Ghana Card");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      let frontUrl = '';
      let backUrl = '';

      if (role === 'rider' && ghanaCardFront && ghanaCardBack) {
        frontUrl = await uploadImage(ghanaCardFront, `riders/${user.uid}/ghana_card_front`);
        backUrl = await uploadImage(ghanaCardBack, `riders/${user.uid}/ghana_card_back`);
      }

      const newUser: User = {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        phoneNumber: null,
        role: (role as 'customer' | 'rider' | 'admin' | 'merchant') || 'customer',
        isOnline: false,
        ghanaCardFront: frontUrl || undefined,
        ghanaCardBack: backUrl || undefined
      };

      await setDoc(doc(db, 'users', user.uid), newUser);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
      handleFirestoreError(err, OperationType.CREATE, 'users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-200/50 backdrop-blur-sm p-4">
      {/* Signup Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[320px] bg-stone-800 rounded-[32px] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="bg-primary p-6 flex items-center justify-between relative">
          <h2 className="text-4xl font-black text-white tracking-tight mx-auto">Register</h2>
          <button 
            onClick={() => navigate('/signup-category')}
            className="absolute right-6 p-1 bg-stone-900/20 rounded-full text-white hover:bg-stone-900/40 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-xs text-red-200 text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <input 
                type="text" 
                placeholder="Full Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-white rounded-xl px-6 py-3.5 text-stone-900 placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-primary transition-all font-medium"
                required
              />
              
              <input 
                type="email" 
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white rounded-xl px-6 py-3.5 text-stone-900 placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-primary transition-all font-medium"
                required
              />

              <input 
                type="text" 
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white rounded-xl px-6 py-3.5 text-stone-900 placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-primary transition-all font-medium"
                required
              />

              <input 
                type="password" 
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white rounded-xl px-6 py-3.5 text-stone-900 placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-primary transition-all font-medium"
                required
                minLength={6}
              />

              <input 
                type="password" 
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white rounded-xl px-6 py-3.5 text-stone-900 placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-primary transition-all font-medium"
                required
                minLength={6}
              />

              {role === 'rider' && (
                <div className="space-y-4 pt-2">
                  <p className="text-xs font-black text-white/60 uppercase tracking-widest">Ghana Card Verification</p>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="relative aspect-video bg-white/5 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 hover:border-primary/50 transition-all overflow-hidden group">
                      {ghanaCardFront ? (
                        <>
                          <img src={ghanaCardFront} alt="Front" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="text-white" size={24} />
                          </div>
                          <CheckCircle2 className="absolute top-2 right-2 text-primary fill-white" size={20} />
                        </>
                      ) : (
                        <>
                          <Upload className="text-white/20 mb-2" size={24} />
                          <span className="text-[10px] font-bold text-white/40 uppercase">Front View</span>
                        </>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'front')} />
                    </label>

                    <label className="relative aspect-video bg-white/5 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 hover:border-primary/50 transition-all overflow-hidden group">
                      {ghanaCardBack ? (
                        <>
                          <img src={ghanaCardBack} alt="Back" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="text-white" size={24} />
                          </div>
                          <CheckCircle2 className="absolute top-2 right-2 text-primary fill-white" size={20} />
                        </>
                      ) : (
                        <>
                          <Upload className="text-white/20 mb-2" size={24} />
                          <span className="text-[10px] font-bold text-white/40 uppercase">Back View</span>
                        </>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'back')} />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-center gap-3 text-white/80 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="w-5 h-5 rounded bg-white border-none text-primary focus:ring-primary focus:ring-offset-0"
              />
              <span className="text-sm font-medium">
                I Agree to the <button type="button" onClick={() => alert('Terms and Conditions coming soon')} className="text-primary hover:underline">Term and Condition</button>
              </span>
            </label>

            {/* Signup Button */}
            <div className="pt-4 flex flex-col gap-4 items-center">
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white py-3.5 rounded-2xl font-black text-xl shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sign Up...' : 'Sign Up'}
              </button>

              <div className="flex items-center gap-3 w-full py-1">
                <div className="flex-1 h-px bg-white/10"></div>
                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">OR</span>
                <div className="flex-1 h-px bg-white/10"></div>
              </div>

              <button 
                type="button"
                onClick={handleGoogleSignup}
                disabled={loading}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
              >
                <Chrome size={18} />
                <span>Sign up with Google</span>
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
