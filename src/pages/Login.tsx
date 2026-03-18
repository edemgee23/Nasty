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
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
      {/* Animated Blurred Background */}
      <div className="absolute inset-0 bg-stone-900">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-600/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/30 rounded-full blur-[120px] animate-pulse delay-700"></div>
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-orange-500/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>
        <div className="absolute bottom-[20%] left-[10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[100px] animate-pulse delay-500"></div>
      </div>

      {/* Back Button */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 text-white/60 hover:text-white flex items-center gap-2 transition-colors z-10"
      >
        <ChevronLeft size={20} />
        <span className="font-bold uppercase tracking-widest text-xs">Back to Home</span>
      </button>

      {/* Login Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-[260px] px-4"
      >
        {/* Avatar Circle */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-primary rounded-full flex items-center justify-center border-[10px] border-stone-900/20 backdrop-blur-3xl z-20 shadow-2xl">
          <User size={32} className="text-white" />
        </div>

        {/* Glass Card */}
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 pt-14 shadow-2xl overflow-hidden">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-xs text-red-200 text-center font-medium">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 w-10 flex items-center justify-center border-r border-white/10 text-white/40 group-focus-within:text-primary transition-colors">
                <Mail size={16} />
              </div>
              <input 
                type="email" 
                placeholder="Email ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-14 pr-4 py-3.5 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium"
                required
              />
            </div>

            {/* Password Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 w-10 flex items-center justify-center border-r border-white/10 text-white/40 group-focus-within:text-primary transition-colors">
                <Lock size={16} />
              </div>
              <input 
                type="password" 
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-14 pr-4 py-3.5 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium"
                required
              />
            </div>

            {/* Options */}
            <div className="flex items-center justify-between text-[10px] font-bold">
              <label className="flex items-center gap-2 text-white/60 cursor-pointer hover:text-white transition-colors">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded bg-white/10 border-white/20 text-primary focus:ring-primary focus:ring-offset-0"
                />
                Remember me
              </label>
              <button 
                type="button" 
                onClick={() => alert('Password reset link sent to your email')}
                className="text-white/40 hover:text-white transition-colors italic"
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white py-3.5 rounded-xl font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'LOGGING IN...' : 'LOGIN'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-white/10"></div>
              <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">OR</span>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>

            {/* Google Login */}
            <button 
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all"
            >
              <Chrome size={18} />
              <span>Sign in with Google</span>
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="mt-8 text-center text-sm text-white/40 font-medium">
          Don't have an account? <button 
            onClick={() => navigate('/signup-category')}
            className="text-accent font-bold hover:underline"
          >
            Sign Up
          </button>
        </p>
      </motion.div>
    </div>
  );
}
