import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { Transaction, TransactionType } from '../types';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  MoreVertical,
  X,
  TrendingUp,
  TrendingDown,
  Calendar,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

const Transactions = () => {
  const { user, profile, updateProfile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<TransactionType | 'all'>('all');
  const [search, setSearch] = useState('');

  // Form state
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  
  const categories = [
    'Food', 'Travel', 'Rent', 'Shopping', 'Bills', 'Entertainment', 'Salary', 'Investment', 'Other'
  ];

  useEffect(() => {
    if (!user) return;

    let q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(txs);
    });

    return unsubscribe;
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount || !category) return;

    const parsedAmount = parseFloat(amount);

    try {
      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        amount: parsedAmount,
        type,
        category,
        notes,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });

      // Update total balance
      if (profile) {
        const balanceChange = type === 'income' ? parsedAmount : -parsedAmount;
        await updateProfile({ totalBalance: profile.totalBalance + balanceChange });
      }

      setIsModalOpen(false);
      // Reset form
      setAmount('');
      setCategory('');
      setNotes('');
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  const handleDelete = async (id: string, deletedAmount: number, deletedType: TransactionType) => {
    try {
      await deleteDoc(doc(db, 'transactions', id));
      
      // Revert total balance
      if (profile) {
        const balanceChange = deletedType === 'income' ? -deletedAmount : deletedAmount;
        await updateProfile({ totalBalance: profile.totalBalance + balanceChange });
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesFilter = filter === 'all' || tx.type === filter;
    const matchesSearch = tx.category.toLowerCase().includes(search.toLowerCase()) || 
                          tx.notes?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Transaction History</h2>
          <p className="text-slate-400 text-sm">Total Logs: {filteredTransactions.length}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <Plus size={20} /> Add Record
        </button>
      </header>

      {/* Filter / Search Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search records..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl glass border-slate-800 focus:border-cyan-500/50 focus:ring-0 transition-all outline-none"
          />
        </div>
        <div className="flex gap-1 p-1 rounded-2xl bg-slate-900/50 border border-slate-800 overflow-x-auto no-scrollbar">
          {(['all', 'income', 'expense'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-semibold capitalize transition-all whitespace-nowrap ${
                filter === f ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="glass-card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          {/* Desktop Table */}
          <table className="w-full text-left hidden sm:table">
            <thead>
              <tr className="text-slate-500 text-xs uppercase tracking-[0.2em] font-bold border-b border-slate-800">
                <th className="px-6 py-4">Transaction</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="group hover:bg-white/2 transition-all">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold">{tx.notes || tx.category}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar size={12} /> {format(new Date(tx.date), 'MMM dd, yyyy · HH:mm')}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                      tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {tx.type === 'income' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-400">{tx.category}</span>
                  </td>
                  <td className={`px-6 py-4 text-right font-bold text-lg ${
                    tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => tx.id && handleDelete(tx.id, tx.amount, tx.type)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile List View */}
          <div className="sm:hidden divide-y divide-slate-800">
            {filteredTransactions.map((tx) => (
              <div key={tx.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-bold text-sm tracking-tight">{tx.notes || tx.category}</p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-1 font-medium">
                      <Calendar size={10} /> {format(new Date(tx.date), 'MMM dd, HH:mm')}
                    </p>
                  </div>
                  <div className={`text-right font-bold text-sm ${
                    tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex gap-2 items-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                      tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {tx.type}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/5">{tx.category}</span>
                  </div>
                  <button 
                    onClick={() => tx.id && handleDelete(tx.id, tx.amount, tx.type)}
                    className="p-2 rounded-lg bg-red-500/5 text-rose-400 transition-all active:scale-95"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredTransactions.length === 0 && (
            <div className="py-20 text-center text-slate-600">
              <History size={48} className="mx-auto mb-4 opacity-20" />
              <p>Scan complete. No data matching parameters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg glass-card !p-8 neon-border shadow-cyan-500/10"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold neon-text">New Transaction</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full">
                  <X />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Type</label>
                  <div className="grid grid-cols-2 gap-4">
                    {(['expense', 'income'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        className={`py-3 rounded-2xl border transition-all font-bold capitalize ${
                          type === t 
                            ? (t === 'income' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-rose-500/10 border-rose-500/50 text-rose-400') 
                            : 'border-slate-800 text-slate-500'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Amount</label>
                    <input 
                      type="number" 
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-3 focus:border-cyan-500/50 outline-none transition-all text-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Category</label>
                    <select
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-3 focus:border-cyan-500/50 outline-none transition-all"
                    >
                      <option value="">Select...</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Notes</label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Brief description..."
                    rows={3}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-3 focus:border-cyan-500/50 outline-none transition-all resize-none"
                  />
                </div>

                {profile && amount && (
                  <div className="p-4 rounded-2xl glass border-cyan-500/20 flex flex-col gap-1 items-center justify-center animate-in fade-in slide-in-from-top-2 shadow-[0_0_20px_rgba(0,242,255,0.05)]">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Remaining Balance</p>
                    <p className={`text-2xl font-mono font-bold tracking-tight ${
                      (profile.totalBalance + (type === 'income' ? parseFloat(amount) : -parseFloat(amount))) >= 0 
                      ? 'text-cyan-400' 
                      : 'text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                    }`}>
                      ₹{(profile.totalBalance + (type === 'income' ? parseFloat(amount) : -parseFloat(amount))).toLocaleString('en-IN')}
                    </p>
                  </div>
                )}

                <button type="submit" className="btn-primary w-full py-4 text-lg">
                  Finalize Log
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Transactions;
