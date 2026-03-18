import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth, onAuthStateChanged, db, doc, getDoc, setDoc, OperationType, handleFirestoreError } from './firebase';
import Home from './pages/Home';
import Order from './pages/Order';
import Tracking from './pages/Tracking';
import Admin from './pages/Admin';
import StationDetails from './pages/StationDetails';
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
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
              <Route path="/admin" element={<Admin user={user} />} />
              <Route path="/station/:id" element={<StationDetails />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  );
}
