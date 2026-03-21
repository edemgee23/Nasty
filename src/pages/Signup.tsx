import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Camera, Upload, CheckCircle2, X, Chrome, ChevronLeft } from 'lucide-react';
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
        role: (role as 'customer' | 'rider') || 'customer',
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
        role: (role as 'customer' | 'rider') || 'customer',
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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="px-6 py-6 flex items-center justify-between">
        <button 
          onClick={() => navigate('/signup-category')}
          className="text-black hover:bg-stone-100 p-2 rounded-full transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 pb-12">
        <div className="w-full max-w-[440px] space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-black tracking-tight">Create an account</h1>
            <p className="text-stone-500 font-medium capitalize">Joining as a {role}</p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-black ml-1">Full Name</label>
                <input 
                  type="text" 
                  placeholder="Enter your full name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-stone-100 rounded-lg px-4 py-3 text-black placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-black transition-all font-medium"
                  required
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-bold text-black ml-1">Email Address</label>
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-stone-100 rounded-lg px-4 py-3 text-black placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-black transition-all font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-black ml-1">Username</label>
                <input 
                  type="text" 
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-stone-100 rounded-lg px-4 py-3 text-black placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-black transition-all font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-black ml-1">Password</label>
                <input 
                  type="password" 
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-stone-100 rounded-lg px-4 py-3 text-black placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-black transition-all font-medium"
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-black ml-1">Confirm Password</label>
                <input 
                  type="password" 
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-stone-100 rounded-lg px-4 py-3 text-black placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-black transition-all font-medium"
                  required
                  minLength={6}
                />
              </div>

              {role === 'rider' && (
                <div className="space-y-4 pt-2">
                  <p className="text-sm font-bold text-black">Ghana Card Verification</p>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="relative aspect-video bg-stone-100 border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-stone-200 transition-all overflow-hidden group">
                      {ghanaCardFront ? (
                        <>
                          <img src={ghanaCardFront} alt="Front" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="text-white" size={24} />
                          </div>
                          <CheckCircle2 className="absolute top-2 right-2 text-uber-green fill-white" size={20} />
                        </>
                      ) : (
                        <>
                          <Upload className="text-stone-400 mb-2" size={24} />
                          <span className="text-[10px] font-bold text-stone-500 uppercase">Front View</span>
                        </>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'front')} />
                    </label>

                    <label className="relative aspect-video bg-stone-100 border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-stone-200 transition-all overflow-hidden group">
                      {ghanaCardBack ? (
                        <>
                          <img src={ghanaCardBack} alt="Back" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="text-white" size={24} />
                          </div>
                          <CheckCircle2 className="absolute top-2 right-2 text-uber-green fill-white" size={20} />
                        </>
                      ) : (
                        <>
                          <Upload className="text-stone-400 mb-2" size={24} />
                          <span className="text-[10px] font-bold text-stone-500 uppercase">Back View</span>
                        </>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'back')} />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-center gap-3 text-stone-600 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="w-5 h-5 rounded border-stone-300 text-black focus:ring-black focus:ring-offset-0"
              />
              <span className="text-sm font-medium">
                I Agree to the <button type="button" onClick={() => alert('Terms and Conditions coming soon')} className="text-black font-bold hover:underline">Terms and Conditions</button>
              </span>
            </label>

            {/* Signup Button */}
            <div className="pt-4 space-y-4">
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-lg font-bold text-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>

              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200"></div>
                </div>
                <span className="relative bg-white px-4 text-xs font-bold text-stone-400 uppercase tracking-widest">or</span>
              </div>

              <button 
                type="button"
                onClick={handleGoogleSignup}
                disabled={loading}
                className="w-full bg-stone-100 hover:bg-stone-200 text-black py-4 rounded-lg font-bold text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <Chrome size={18} />
                <span>Sign up with Google</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
