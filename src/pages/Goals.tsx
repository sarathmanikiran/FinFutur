import React, { useState, useEffect } from 'react';
import { Target, Flag, Rocket, Trophy, Plus, Check, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Goal } from '../types';

const Goals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'goals'),
      where('userId', '==', user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const parsedGoals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal));
      setGoals(parsedGoals);
    });
    return unsubscribe;
  }, [user]);

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name || !targetAmount) return;

    try {
      await addDoc(collection(db, 'goals'), {
        userId: user.uid,
        name,
        targetAmount: parseFloat(targetAmount) || 0,
        currentAmount: parseFloat(currentAmount) || 0,
        deadline,
        status: 'active'
      });
      setIsModalOpen(false);
      setName('');
      setTargetAmount('');
      setCurrentAmount('');
      setDeadline('');
    } catch (error) {
      console.error("Error adding goal:", error);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: Goal['status']) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'goals', id), { status: newStatus });
    } catch (error) {
      console.error("Error updating goal:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'goals', id));
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Mission Objectives</h2>
          <p className="text-slate-400 text-sm">Track and achieve your financial milestones.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
          <Plus size={20} /> Establish New Goal
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {goals.length > 0 ? goals.map((goal, i) => {
          const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) || 0;
          const isCompleted = goal.status === 'completed';
          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`glass-card flex flex-col group relative overflow-hidden ${isCompleted ? 'border-emerald-500/50 grayscale-[50%]' : ''}`}
            >
              {isCompleted && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)] z-10 transition-all">
                  Objective Completed
                </div>
              )}
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl bg-white/5 ${isCompleted ? 'text-emerald-400' : 'text-cyan-400'}`}>
                  {isCompleted ? <Trophy size={24} /> : <Target size={24} />}
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!isCompleted && (
                    <button onClick={() => goal.id && handleUpdateStatus(goal.id, 'completed')} className="p-1.5 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-all" title="Mark Complete">
                      <Check size={16} />
                    </button>
                  )}
                  <button onClick={() => goal.id && handleDelete(goal.id)} className="p-1.5 hover:bg-red-500/20 text-rose-400 rounded-lg transition-all" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:neon-text transition-all">{goal.name}</h3>
              <p className="text-sm text-slate-500 mb-6">Target: ₹{goal.targetAmount.toLocaleString('en-IN')}</p>
              
              <div className="space-y-2 mt-auto">
                <div className="flex justify-between text-xs font-bold font-mono tracking-widest uppercase">
                  <span className={isCompleted ? "text-emerald-400" : "text-cyan-400"}>{progress.toFixed(1)}% Completed</span>
                  <span className="text-slate-500">₹{goal.currentAmount.toLocaleString('en-IN')} / ₹{goal.targetAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-gradient-to-r from-cyan-400 to-blue-600'}`}
                  />
                </div>
                {goal.deadline && (
                  <p className="text-right text-[10px] text-slate-500 mt-2 uppercase tracking-widest">
                    Deadline: {goal.deadline}
                  </p>
                )}
              </div>
            </motion.div>
          );
        }) : (
          <div className="col-span-full py-20 text-center text-slate-600">
            <Target size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-sm font-bold uppercase tracking-widest">No active objectives.</p>
          </div>
        )}
      </div>

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
                <h3 className="text-2xl font-bold neon-text">New Objective</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full">
                  <X />
                </button>
              </div>

              <form onSubmit={handleAddGoal} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Objective Name</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Emergency Fund"
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-3 focus:border-cyan-500/50 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Target Amount (₹)</label>
                    <input 
                      type="number" 
                      required
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-3 focus:border-cyan-500/50 outline-none transition-all text-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Current Amount (₹)</label>
                    <input 
                      type="number" 
                      value={currentAmount}
                      onChange={(e) => setCurrentAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-3 focus:border-cyan-500/50 outline-none transition-all text-xl font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Est. Deadline</label>
                   <input 
                    type="date" 
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-3 focus:border-cyan-500/50 outline-none transition-all"
                  />
                </div>

                <button type="submit" className="btn-primary w-full py-4 text-lg">
                  Initialize Goal
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Goals;
