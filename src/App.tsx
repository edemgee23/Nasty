import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { auth, onAuthStateChanged, db, doc, getDoc, setDoc, OperationType, handleFirestoreError } from './firebase';
import Home from './pages/Home';
import Order from './pages/Order';
import Tracking from './pages/Tracking';
import Login from './pages/Login';
import SignupCategory from './pages/SignupCategory';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import { User } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setUser(userDoc.data() as User);
          } else {
            // Create new user profile
            const newUser: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              phoneNumber: firebaseUser.phoneNumber,
              role: 'customer'
            };
            await setDoc(userDocRef, newUser);
            setUser(newUser);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-primary text-white">
        <div className="flex items-center gap-2 mb-4">
          <span className="font-black text-4xl tracking-tighter italic">FLASH</span>
          <Zap className="text-accent fill-accent animate-pulse" size={48} />
          <span className="font-black text-4xl tracking-tighter italic">DELIVERY</span>
        </div>
        <div className="w-12 h-1 bg-white/20 rounded-full overflow-hidden">
          <div className="w-full h-full bg-accent origin-left animate-[loading_1.5s_ease-in-out_infinite]"></div>
        </div>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes loading {
            0% { transform: scaleX(0); }
            50% { transform: scaleX(1); }
            100% { transform: scaleX(0); transform-origin: right; }
          }
        `}} />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup-category" element={<SignupCategory />} />
        <Route path="/signup/:role" element={<Signup />} />
        <Route path="*" element={
          <Layout user={user}>
            <Routes>
              <Route path="/" element={<Home user={user} />} />
              <Route path="/dashboard" element={<Dashboard user={user} />} />
              <Route path="/order" element={<Order user={user} />} />
              <Route path="/tracking/:orderId" element={<Tracking user={user} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  );
}
