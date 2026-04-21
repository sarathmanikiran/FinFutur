import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Transaction } from '../types';
import { 
  PieChart as RechartsPieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { PieChart as PieIcon, BarChart as BarIcon, TrendingUp } from 'lucide-react';

const COLORS = ['#00f2ff', '#3b82f6', '#8b5cf6', '#ff00ea', '#f59e0b', '#10b981', '#ef4444'];

const Analytics = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'transactions'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(txs);
    });
    return unsubscribe;
  }, [user]);

  // Aggregate Category Distribution (Expenses)
  const categoryMap = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((acc: any, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {});
  const categoryData = Object.keys(categoryMap).map(key => ({
    name: key,
    value: categoryMap[key]
  }));

  // Aggregate Income vs Expense by Month
  const monthlyMap = transactions.reduce((acc: any, tx) => {
    const month = new Date(tx.date).toLocaleString('default', { month: 'short' });
    if (!acc[month]) acc[month] = { name: month, income: 0, expense: 0 };
    acc[month][tx.type] += tx.amount;
    return acc;
  }, {});
  const monthlyData = Object.values(monthlyMap);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <h2 className="text-2xl sm:text-3xl font-bold">Spatial Analytics</h2>
        <p className="text-slate-400 text-sm">Deep dive into your financial flow patterns.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Distribution */}
        <div className="glass-card flex flex-col items-center justify-center min-h-[400px] p-6">
          <h3 className="w-full text-xs font-bold uppercase tracking-[0.2em] text-white/60 mb-6 flex items-center gap-2">
            <PieIcon size={16} className="text-cyan-400" /> Category Distribution (Expenses)
          </h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(3, 7, 18, 0.9)', border: '1px solid rgba(0, 242, 255, 0.2)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
                />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-600 h-[300px]">
              <PieIcon size={48} className="mb-4 opacity-20" />
              <p className="text-[10px] font-bold uppercase tracking-widest">No Expense Data</p>
            </div>
          )}
        </div>

        {/* Income vs Expense Projection */}
        <div className="glass-card flex flex-col items-center justify-center min-h-[400px] p-6">
          <h3 className="w-full text-xs font-bold uppercase tracking-[0.2em] text-white/60 mb-6 flex items-center gap-2">
            <BarIcon size={16} className="text-rose-400" /> Income vs Expense Projection
          </h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff20" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: 'rgba(3, 7, 18, 0.9)', border: '1px solid rgba(0, 242, 255, 0.2)', borderRadius: '12px' }}
                  formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
                />
                <Legend />
                <Bar dataKey="income" fill="#00f2ff" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="#ff00ea" radius={[4, 4, 0, 0]} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-600 h-[300px]">
              <BarIcon size={48} className="mb-4 opacity-20" />
              <p className="text-[10px] font-bold uppercase tracking-widest">No Transaction Data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
