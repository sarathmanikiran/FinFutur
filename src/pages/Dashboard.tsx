import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Plus, 
  Sparkles,
  Zap,
  User as UserIcon,
  BrainCircuit
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Transaction } from '../types';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  CartesianGrid, 
  ResponsiveContainer 
} from 'recharts';
import { format } from 'date-fns';

import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(txs);
      
      // Aggregate chart data (last 7 days based on transactions)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
          name: format(d, 'EEE'),
          date: format(d, 'yyyy-MM-dd'),
          income: 0,
          expense: 0
        };
      });

      txs.forEach(tx => {
        const txDate = format(new Date(tx.date), 'yyyy-MM-dd');
        const dayMatch = last7Days.find(d => d.date === txDate);
        if (dayMatch) {
          if (tx.type === 'income') dayMatch.income += tx.amount;
          else dayMatch.expense += tx.amount;
        }
      });

      setChartData(last7Days);
    });

    return unsubscribe;
  }, [user]);

  // Calculations
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const monthlyExpenses = transactions
    .filter(tx => tx.type === 'expense' && new Date(tx.date) >= thirtyDaysAgo)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const weeklyExpenses = transactions
    .filter(tx => tx.type === 'expense' && new Date(tx.date) >= sevenDaysAgo)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-light">
            Good morning, <span className="font-bold">{profile?.displayName?.split(' ')[0] || 'User'}</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Telemetry systems online. All parameters nominal.</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest w-full sm:w-auto">
          <button 
            onClick={() => navigate('/transactions')}
            className="btn-primary flex items-center justify-center gap-2 !py-2 !px-4 !text-[10px] !rounded-xl flex-1 sm:flex-none"
          >
            <Plus size={14} /> New Record
          </button>
          <button onClick={() => navigate('/profile')} className="w-10 h-10 rounded-full border-2 border-cyan-400 p-0.5 shadow-[0_0_10px_rgba(0,242,255,0.2)] hover:scale-105 transition-transform cursor-pointer group shrink-0">
            <div className="w-full h-full rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
               <UserIcon size={20} className="text-white/40 group-hover:text-cyan-400 transition-colors" />
            </div>
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card neon-border-cyan relative">
          <div>
            <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold mb-1">Total Balance</div>
            <div className="text-3xl font-bold font-mono tracking-tight text-white">
              ₹{profile?.totalBalance.toLocaleString('en-IN')}
              <span className="text-sm text-white/40 ml-1">.00</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-4">
            <TrendingUp size={12} /> Active Capital
          </div>
          <button onClick={() => navigate('/insights')} className="absolute top-4 right-4 p-2 bg-gradient-to-r from-[#ff00ea]/20 to-[#8a00ff]/20 text-[#00f2ff] hover:text-white rounded-lg border border-[#ff00ea]/30 shadow-[0_0_10px_rgba(255,0,234,0.2)] transition-all group" title="AI Suggestions">
             <BrainCircuit size={16} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>

        <div className="stat-card border border-white/5">
          <div>
            <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold mb-1">Monthly Expenses</div>
            <div className="text-3xl font-bold font-mono tracking-tight text-white">
              ₹{monthlyExpenses.toLocaleString('en-IN')}
              <span className="text-sm text-white/40 ml-1">.00</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-rose-400 font-bold uppercase tracking-widest mt-4">
            <TrendingDown size={12} /> Past 30 Days
          </div>
        </div>

        <div className="stat-card border border-white/5">
          <div>
            <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold mb-1">Weekly Expenses</div>
            <div className="text-3xl font-bold font-mono tracking-tight text-white">
              ₹{weeklyExpenses.toLocaleString('en-IN')}
              <span className="text-sm text-white/40 ml-1">.00</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-amber-400 font-bold uppercase tracking-widest mt-4">
            <Activity size={12} /> Past 7 Days
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8">
        {/* Main Chart */}
        <div className="glass-card flex flex-col p-8">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Cash Flow Trend</h2>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00f2ff] shadow-[0_0_8px_#00f2ff]"></span>
                <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full neon-bg-magenta shadow-[0_0_8px_#ff00ea]"></span>
                <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase">Expense</span>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#00f2ff" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff00ea" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ff00ea" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                <XAxis 
                   dataKey="name" 
                   stroke="#ffffff20" 
                   fontSize={10} 
                   fontWeight="bold"
                   tickLine={false} 
                   axisLine={false} 
                />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#00f2ff" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorIncome)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="expense" 
                  stroke="#ff00ea" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorExpense)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="glass-card flex flex-col p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Recent Activity</h2>
          </div>
          <div className="space-y-4 flex-1">
            {recentTransactions.length > 0 ? recentTransactions.map((tx, i) => (
              <div key={tx.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/2 hover:bg-white/5 transition-all border border-transparent hover:border-white/5 group">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <Zap size={18} className="text-white/40 group-hover:text-cyan-400 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate tracking-wide">{tx.category}</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold mt-0.5">{tx.notes || 'Transaction'}</p>
                </div>
                <div className={`text-xs font-bold font-mono tracking-tight ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                </div>
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-white/20 space-y-2 py-10">
                <Activity size={32} className="opacity-20" />
                <p className="text-[10px] font-bold uppercase tracking-widest">No telemetry logs</p>
              </div>
            )}
          </div>
          <button onClick={() => navigate('/transactions')} className="mt-8 w-full py-3 glass hover:bg-white/10 text-[10px] font-bold uppercase tracking-[0.2em] transition-all rounded-xl border-white/5">
            Synchronize All
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
