import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User, Shield, CreditCard, Bell, Settings, LogOut, Edit2, Check, X } from 'lucide-react';
import { logout } from '../lib/firebase';

const Profile = () => {
  const { profile, updateProfile } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBalance, setEditBalance] = useState('');

  const handleEditTrigger = () => {
    setEditName(profile?.displayName || '');
    setEditBalance(profile?.totalBalance.toString() || '0');
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        displayName: editName,
        totalBalance: parseFloat(editBalance) || 0
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save profile:", error);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-700">
      <header>
        <h2 className="text-2xl sm:text-3xl font-bold">Identity Protocol</h2>
        <p className="text-slate-400 text-sm">Manage your system credentials and preferences.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8">
        <div className="space-y-6">
          <div className="glass-card flex flex-col items-center text-center relative">
            {!isEditing ? (
              <button onClick={handleEditTrigger} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-full transition-all">
                <Edit2 size={16} />
              </button>
            ) : (
              <button onClick={() => setIsEditing(false)} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-all">
                <X size={16} />
              </button>
            )}

            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 p-1 mb-4 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full rounded-full bg-[#030712] flex items-center justify-center">
                <User size={48} className="text-cyan-400" />
              </div>
            </div>

            {isEditing ? (
              <div className="w-full space-y-4">
                <div className="text-left w-full">
                  <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Display Name</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full mt-1 bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:border-cyan-500 outline-none"
                  />
                </div>
                <div className="text-left w-full">
                  <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Base Balance (₹)</label>
                  <input 
                    type="number" 
                    value={editBalance}
                    onChange={(e) => setEditBalance(e.target.value)}
                    className="w-full mt-1 bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:border-cyan-500 outline-none"
                  />
                </div>
                <button onClick={handleSave} className="w-full py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest hover:bg-emerald-500/20 transition-all">
                  <Check size={16} /> Save Changes
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold">{profile?.displayName}</h3>
                <p className="text-slate-500 text-sm">{profile?.email}</p>
                <div className="mt-4 p-3 bg-slate-900/50 rounded-xl w-full border border-slate-800">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Total Balance</p>
                  <p className="font-mono font-bold text-cyan-400">₹{profile?.totalBalance.toLocaleString('en-IN')}</p>
                </div>
              </>
            )}
          </div>

          <div className="glass-card">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Integrations</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Shield size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold">2FA Security</p>
                    <p className="text-[10px] text-slate-500">Device Protocol Active</p>
                  </div>
                </div>
                <div className="w-8 h-4 bg-emerald-500/40 rounded-full relative">
                  <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Linked Protocols</p>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                      <CreditCard size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold">Mercury Bank</p>
                      <p className="text-[10px] text-slate-500">Connected via Plaid</p>
                    </div>
                  </div>
                  <button className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all" title="Disconnect Account">
                    <LogOut size={14} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <CreditCard size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold">Neo Savings</p>
                      <p className="text-[10px] text-slate-500">Manual Sync Active</p>
                    </div>
                  </div>
                  <button className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all" title="Disconnect Account">
                    <LogOut size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Settings size={20} /> System Preferences
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5">
                <div>
                  <p className="font-semibold">Neural Suggestions</p>
                  <p className="text-xs text-slate-500">Allow AI to provide real-time spending advice.</p>
                </div>
                <div className="w-12 h-6 bg-cyan-600 rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
              
              <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5">
                <div>
                  <p className="font-semibold">Holographic Feedback</p>
                  <p className="text-xs text-slate-500">Enable advanced UI animations and transitions.</p>
                </div>
                <div className="w-12 h-6 bg-cyan-600 rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>

              <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5">
                <div>
                  <p className="font-semibold">Telemetry Notifications</p>
                  <p className="text-xs text-slate-500">Receive alerts for critical spending thresholds.</p>
                </div>
                <div className="w-12 h-6 bg-slate-800 rounded-full relative">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={logout}
            className="w-full py-4 glass text-red-400 font-bold uppercase tracking-widest rounded-2xl hover:bg-red-500/10 border-red-500/20 flex items-center justify-center gap-2 transition-all"
          >
            <LogOut size={20} /> Terminate Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
