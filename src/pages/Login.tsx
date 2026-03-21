import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, Lock, Mail, ChevronLeft, Chrome } from 'lucide-react';
import { auth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, OperationType, handleFirestoreError, db, doc, getDoc } from '../firebase';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        // New user from login page - redirect to role selection
        navigate('/signup-category');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Google login failed', error);
      setError(error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
      handleFirestoreError(err, OperationType.GET, 'users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
      {/* Minimal Header */}
      <header className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between">
        <div className="text-2xl font-bold tracking-tighter text-black">FLASH</div>
        <button 
          onClick={() => navigate('/')}
          className="text-sm font-bold text-black hover:underline"
        >
          Close
        </button>
      </header>

      {/* Login Form */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md px-6 space-y-8"
      >
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-black">Welcome back</h1>
          <p className="text-stone-500 font-medium">Sign in with your email address or Google account.</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-widest">Email</label>
              <input 
                type="email" 
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-stone-100 border-none rounded-lg px-4 py-4 text-black placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-black transition-all font-medium"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-widest">Password</label>
              <input 
                type="password" 
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-stone-100 border-none rounded-lg px-4 py-4 text-black placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-black transition-all font-medium"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <label className="flex items-center gap-2 text-sm font-medium text-stone-600 cursor-pointer">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-stone-300 text-black focus:ring-black"
              />
              Remember me
            </label>
            <button 
              type="button" 
              onClick={() => alert('Password reset link sent to your email')}
              className="text-sm font-bold text-black hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-lg font-bold text-lg hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-stone-200"></div>
            <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-stone-200"></div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-white border border-stone-200 text-black py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-3 hover:bg-stone-50 transition-all active:scale-95"
          >
            <Chrome size={20} />
            <span>Continue with Google</span>
          </button>
        </form>

        <p className="text-center text-stone-500 font-medium pt-4">
          New to Flash? <button 
            onClick={() => navigate('/signup-category')}
            className="text-black font-bold hover:underline"
          >
            Create an account
          </button>
        </p>
      </motion.div>
    </div>
  );
}
