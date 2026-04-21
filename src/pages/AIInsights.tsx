import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BrainCircuit, 
  Sparkles, 
  TrendingDown, 
  TrendingUp, 
  AlertCircle,
  Lightbulb,
  Zap,
  RefreshCcw,
  Loader2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Transaction } from '../types';
import { ai, MODELS } from '../lib/gemini';

const AIInsights = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<any>(null);

  const generateInsights = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // 1. Fetch data for analysis
      const q = query(collection(db, 'transactions'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const txs = snapshot.docs.map(doc => doc.data() as Transaction);

      // 2. Prepare prompt
      const summary = {
        totalBalance: profile?.totalBalance,
        healthScore: profile?.financialHealthScore,
        txCount: txs.length,
        expenses: txs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
        income: txs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
        categories: txs.reduce((acc: any, t) => {
          if (t.type === 'expense') {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
          }
          return acc;
        }, {})
      };

      const prompt = `
        Analyze this financial data for a user named ${profile?.displayName}:
        ${JSON.stringify(summary, null, 2)}
        
        Provide:
        1. A brief summary of their financial state.
        2. 3 actionable smart suggestions to improve savings.
        3. A spending prediction for next month based on current trends.
        4. A "Financial Health Remark" (e.g., Stable, Warning, Critical).
        
        Keep in mind all values are in Indian Rupees (INR/₹).
        Return the response in a clean, futuristic, encouraging tone.
        Format your response as a JSON object with keys: summary, suggestions (array), prediction, remark.
      `;

      // 3. Call Gemini
      const response = await ai.models.generateContent({
        model: MODELS.GENERAL,
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const result = JSON.parse(response.text || '{}');
      setInsights(result);
    } catch (error) {
      console.error("AI Insight Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !insights) {
      generateInsights();
    }
  }, [user]);

  return (
    <div className="space-y-8 animate-in zoom-in duration-700">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-2 sm:p-3 rounded-2xl bg-cyan-500/10 text-cyan-400">
            <BrainCircuit size={28} />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">Neural Engine</h2>
            <p className="text-slate-400 text-sm">Advanced financial telemetry analysis.</p>
          </div>
        </div>
        <button 
          onClick={generateInsights}
          disabled={loading}
          className="w-full sm:w-auto flex items-center justify-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-medium border border-cyan-500/20 px-4 py-2 rounded-xl bg-cyan-500/5 text-sm"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCcw size={18} />} 
          Recalibrate
        </button>
      </header>

      {loading ? (
        <div className="h-[400px] flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <Loader2 className="animate-spin text-cyan-500" size={64} />
            <Sparkles className="absolute -top-2 -right-2 text-blue-400 animate-pulse" size={24} />
          </div>
          <p className="text-slate-500 font-mono italic animate-pulse">Processing data patterns...</p>
        </div>
      ) : insights ? (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8">
          <div className="space-y-8">
            {/* Health Remark */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`glass-card !border-2 ${
                insights.remark === 'Critical' ? 'border-rose-500/30 bg-rose-500/5' : 
                insights.remark === 'Warning' ? 'border-amber-500/30 bg-amber-500/5' : 
                'border-cyan-500/30 bg-cyan-500/5'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500">System Status</p>
                <AlertCircle className={insights.remark === 'Critical' ? 'text-rose-400' : insights.remark === 'Warning' ? 'text-amber-400' : 'text-cyan-400'} size={20} />
              </div>
              <h3 className="text-4xl font-black italic uppercase italic tracking-tighter mb-2">{insights.remark}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{insights.summary}</p>
            </motion.div>

            {/* Prediction */}
            <div className="glass-card">
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Zap size={16} /> Trajectory Forecast
              </h4>
              <p className="text-xl font-medium leading-relaxed neon-text">
                "{insights.prediction}"
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-3 px-4">
              <Lightbulb className="text-amber-400" /> Strategic Adjustments
            </h3>
            <div className="grid gap-4">
              {insights.suggestions.map((suggestion: string, i: number) => (
                <motion.div
                  key={i}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.15 }}
                  className="glass-card relative overflow-hidden group hover:bg-white/5"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-blue-600" />
                  <div className="flex gap-4">
                    <span className="text-4xl font-black text-slate-800 pointer-events-none select-none">0{i+1}</span>
                    <p className="text-slate-300 py-2 leading-relaxed">{suggestion}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card h-[400px] flex flex-col items-center justify-center text-slate-500">
          <BrainCircuit size={64} className="opacity-10 mb-4" />
          <p>Initialize engine to analyze your telemetry.</p>
          <button onClick={generateInsights} className="btn-primary mt-6">Start Analysis</button>
        </div>
      )}
    </div>
  );
};

export default AIInsights;
