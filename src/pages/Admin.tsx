import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { LayoutDashboard, Truck, Package, Users, Search, Filter, MoreVertical, CheckCircle, Clock, AlertCircle, Trash2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { db, collection, onSnapshot, query, orderBy, updateDoc, doc, deleteDoc, OperationType, handleFirestoreError, where } from '../firebase';
import { User, Order as AppOrder } from '../types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AdminProps {
  user: User | null;
}

export default function Admin({ user }: AdminProps) {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState<AppOrder[]>([]);
  const [riders, setRiders] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppOrder));
      setOrders(ordersData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    });

    const qRiders = query(collection(db, 'users'), where('role', '==', 'rider'));
    const unsubRiders = onSnapshot(qRiders, (snapshot) => {
      const ridersData = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
      setRiders(ridersData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
      setLoading(false);
    });

    return () => {
      unsubOrders();
      unsubRiders();
    };
  }, [user]);

  if (!user || user.role !== 'admin') return <Navigate to="/" />;

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { 
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteDoc(doc(db, 'orders', orderId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `orders/${orderId}`);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    active: orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length,
    revenue: orders.filter(o => o.status === 'delivered').reduce((acc, o) => acc + o.totalPrice, 0),
    completed: orders.filter(o => o.status === 'delivered').length
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Admin Dashboard</h1>
          <p className="text-stone-500">Manage orders, riders, and deliveries</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-stone-200 shadow-sm">
          <button 
            onClick={() => setActiveTab('orders')}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-bold transition-all",
              activeTab === 'orders' ? "bg-stone-900 text-white shadow-lg" : "text-stone-500 hover:bg-stone-50"
            )}
          >
            Orders
          </button>
          <button 
            onClick={() => setActiveTab('riders')}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-bold transition-all",
              activeTab === 'riders' ? "bg-stone-900 text-white shadow-lg" : "text-stone-500 hover:bg-stone-50"
            )}
          >
            Riders
          </button>
        </div>
      </div>

      {activeTab === 'orders' ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Active Orders', value: stats.active.toString(), icon: Package, color: 'text-primary', bg: 'bg-primary/5' },
              { label: 'Completed', value: stats.completed.toString(), icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Total Revenue', value: `$${stats.revenue.toFixed(2)}`, icon: LayoutDashboard, color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Total Orders', value: orders.length.toString(), icon: Clock, color: 'text-accent', bg: 'bg-accent/10' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-black text-stone-900">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search orders, customers..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-100 rounded-2xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50/50">
                    <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Order ID</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Customer</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Items</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Total</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-stone-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="text-sm font-black text-stone-900">#{order.id.slice(0, 8).toUpperCase()}</span>
                        <p className="text-[10px] text-stone-400 font-bold uppercase">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-stone-700">{order.customerName}</span>
                        <p className="text-[10px] text-stone-400 font-bold uppercase">{order.customerPhone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {order.items ? (
                            order.items.map((item, idx) => (
                              <p key={idx} className="text-[10px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded inline-block mr-1">
                                {item.quantity}x {item.name}
                              </p>
                            ))
                          ) : (
                            <span className="text-xs font-bold text-stone-600 bg-stone-100 px-2 py-1 rounded-lg">
                              {order.amount} gal {order.gasType}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider outline-none border-none cursor-pointer",
                            order.status === 'pending' ? "bg-accent/10 text-accent" :
                            order.status === 'in-transit' ? "bg-blue-50 text-blue-600" :
                            order.status === 'delivered' ? "bg-primary/5 text-primary" :
                            "bg-red-50 text-red-600"
                          )}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="in-transit">In Transit</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-black text-stone-900">${order.totalPrice.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-6 bg-stone-50/50 border-t border-stone-100 flex items-center justify-between">
              <p className="text-xs text-stone-400 font-bold">Showing {filteredOrders.length} of {orders.length} orders</p>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-stone-100">
            <h2 className="text-xl font-bold text-stone-900">Rider Verification</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/50">
                  <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Rider</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Ghana Card (Front)</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Ghana Card (Back)</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {riders.map((rider) => (
                  <tr key={rider.uid} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-stone-100 overflow-hidden">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${rider.uid}`} alt="avatar" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-stone-900">{rider.displayName}</p>
                          <p className="text-[10px] text-stone-400 font-bold uppercase">{rider.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {rider.ghanaCardFront ? (
                        <a href={rider.ghanaCardFront} target="_blank" rel="noreferrer" className="block w-24 aspect-video rounded-lg overflow-hidden border border-stone-200 hover:scale-105 transition-transform">
                          <img src={rider.ghanaCardFront} alt="Front" className="w-full h-full object-cover" />
                        </a>
                      ) : (
                        <span className="text-[10px] font-bold text-stone-400 uppercase">Not Uploaded</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {rider.ghanaCardBack ? (
                        <a href={rider.ghanaCardBack} target="_blank" rel="noreferrer" className="block w-24 aspect-video rounded-lg overflow-hidden border border-stone-200 hover:scale-105 transition-transform">
                          <img src={rider.ghanaCardBack} alt="Back" className="w-full h-full object-cover" />
                        </a>
                      ) : (
                        <span className="text-[10px] font-bold text-stone-400 uppercase">Not Uploaded</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        rider.ghanaCardFront && rider.ghanaCardBack ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                      )}>
                        {rider.ghanaCardFront && rider.ghanaCardBack ? 'Ready for Review' : 'Pending Upload'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
