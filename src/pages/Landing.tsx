import React from 'react';
import { motion } from 'motion/react';
import { Zap, Shield, PieChart, Sparkles, ArrowRight } from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#030712] relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />

      {/* Navbar */}
      <nav className="relative z-10 px-4 sm:px-8 py-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Zap className="text-white fill-white" size={20} />
          </div>
          <span className="text-xl sm:text-2xl font-bold neon-text">FinFutur</span>
        </div>
        <button 
          onClick={signInWithGoogle}
          className="px-4 sm:px-6 py-2 rounded-full border border-slate-700 hover:bg-white/5 transition-all text-sm font-medium"
        >
          Login
        </button>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 pt-10 sm:pt-20 pb-20 sm:pb-32 grid lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center lg:text-left flex flex-col items-center lg:items-start"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] sm:text-sm font-medium mb-6 sm:mb-8">
            <Sparkles size={16} />
            AI-POWERED FINANCIAL EVOLUTION
          </div>
          <h1 className="text-4xl sm:text-7xl font-bold leading-tight mb-6 sm:mb-8 tracking-tighter">
            The Future of <br className="hidden sm:block" />
            <span className="neon-text">Wealth Management</span> <br className="hidden sm:block" />
            is Intelligent.
          </h1>
          <p className="text-base sm:text-xl text-slate-400 max-w-xl mb-8 sm:mb-12">
            Track, analyze, and optimize your finances with high-performance AI insights. 
            Experience the next generation of personal ledger systems.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto">
            <button 
              onClick={signInWithGoogle}
              className="btn-primary flex items-center justify-center gap-2 py-4 sm:py-3"
            >
              Initialize Engine <ArrowRight size={20} />
            </button>
            <button className="px-8 py-4 rounded-full border border-slate-800 hover:bg-white/5 transition-all font-semibold text-sm">
              System Specs
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="hidden lg:block relative"
        >
          <div className="glass-card !p-0 overflow-hidden relative border-cyan-500/30 group">
            <img 
              src="https://picsum.photos/seed/finance/800/800" 
              alt="Dashboard Preview" 
              className="w-full opacity-60 grayscale group-hover:grayscale-0 transition-all duration-1000"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent" />
            
            {/* Floaties */}
            <div className="absolute top-10 left-[-40px] glass p-4 rounded-2xl border-cyan-400/50 flex items-center gap-3 animate-float w-fit">
              <Shield className="text-cyan-400" size={24} />
              <div>
                <p className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Protocol</p>
                <p className="text-sm font-bold">Encrypted</p>
              </div>
            </div>
            
            <div className="absolute bottom-20 right-[-20px] glass p-4 rounded-2xl border-blue-400/50 flex items-center gap-3 animate-float animation-delay-2000 w-fit">
              <PieChart className="text-blue-400" size={24} />
              <div>
                <p className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Growth</p>
                <p className="text-sm font-bold">+24.5%</p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 py-32 border-t border-slate-900">
        <div className="grid md:grid-cols-3 gap-12">
          {[
            {
              icon: Sparkles,
              title: "Neural Insights",
              desc: "Context-aware financial advice powered by advanced large language models."
            },
            {
              icon: Shield,
              title: "Digital Vault",
              desc: "Bank-grade data isolation ensuring your transaction history remains yours."
            },
            {
              icon: PieChart,
              title: "Real-time Metrics",
              desc: "Instant dynamic visualizers that respond to every micro-transaction."
            }
          ].map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="glass-card border-none hover:bg-white/5"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mb-6 text-cyan-400">
                <feat.icon size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
              <p className="text-slate-400">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Landing;
