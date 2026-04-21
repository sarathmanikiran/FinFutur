import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Bot, 
  User as UserIcon, 
  Loader2, 
  Sparkles,
  ChevronRight,
  Mic,
  Volume2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ai, MODELS } from '../lib/gemini';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

interface Message {
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const FinancialBot = () => {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: "Interface active. I am your financial intelligence unit. How can I assist with your telemetry today?", timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !user || loading) return;

    const userMsg: Message = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Fetch some context if needed
      const q = query(collection(db, 'transactions'), where('userId', '==', user.uid), orderBy('date', 'desc'), limit(10));
      const snap = await getDocs(q);
      const recentData = snap.docs.map(d => d.data());

      const systemPrompt = `
        You are 'FinFutur Intelligence', a high-tech financial AI.
        User Name: ${profile?.displayName}
        Current Balance: ₹${profile?.totalBalance}
        Recent Transactions: ${JSON.stringify(recentData)}
        
        Note: The user's currency is Indian Rupees (INR/₹). Always format money with ₹ and the Indian numbering system.
        Tone: Professional, futuristic, concise, and helpful.
        Objective: Answer questions about their spending, give advice, or just chat about finance.
      `;

      const response = await ai.models.generateContent({
        model: MODELS.GENERAL,
        contents: [
          { role: 'user', parts: [{ text: systemPrompt + "\n\nUser Question: " + input }] }
        ]
      });

      const botMsg: Message = { 
        role: 'bot', 
        content: response.text || "Diagnostic failed. Error in data retrieval.", 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Bot Error:", error);
      setMessages(prev => [...prev, { role: 'bot', content: "Neural link interrupted. Please check connection.", timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-10rem)] sm:h-[calc(100vh-8rem)] flex flex-col space-y-6 animate-in slide-in-from-right-4 duration-700">
      <header className="flex items-center gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
          <Bot size={24} />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Intelligence Terminal</h2>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Encryption: Active</p>
          </div>
        </div>
      </header>

      <div className="flex-1 glass border-white/5 flex flex-col p-0 overflow-hidden relative rounded-2xl">
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1 ${
                  msg.role === 'user' ? 'bg-cyan-500 text-white' : 'neon-bg-magenta text-white shadow-[0_0_10px_rgba(255,0,234,0.3)]'
                }`}>
                  {msg.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
                </div>
                <div className={`p-4 rounded-xl ${
                  msg.role === 'user' 
                    ? 'bg-cyan-500/10 text-cyan-100 border border-cyan-500/20' 
                    : 'bg-white/5 text-slate-200 border border-white/5'
                }`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-4 items-center bg-white/5 p-4 rounded-xl border border-white/5">
                <Loader2 className="animate-spin text-cyan-500" size={16} />
                <p className="text-xs text-white/40 font-bold uppercase tracking-widest italic">Computing logic...</p>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-transparent">
          <div className="h-12 glass flex items-center px-4 gap-4 neon-border-cyan border-opacity-20 rounded-xl relative">
            <div className="w-6 h-6 rounded-full neon-bg-magenta flex items-center justify-center shrink-0 shadow-[0_0_8px_#ff00ea]">
               <Bot size={12} className="text-white" />
            </div>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask AI: Where did I spend the most last week?"
              className="bg-transparent border-none outline-none flex-1 text-sm text-white/60 placeholder:text-white/20"
            />
            <div className="text-[10px] text-white/30 uppercase tracking-widest font-bold hidden md:block">Press Enter to ask</div>
            <button 
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="p-2 text-cyan-400 hover:text-cyan-300 disabled:opacity-0 transition-all"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialBot;
