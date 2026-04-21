import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  History as HistoryIcon, 
  PieChart, 
  Target, 
  User as UserIcon, 
  LogOut,
  BrainCircuit,
  MessageSquare,
  Zap
} from 'lucide-react';
import { logout } from '../../lib/firebase';
import { motion } from 'motion/react';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Analytics', icon: PieChart, path: '/analytics' },
    { name: 'Transactions', icon: HistoryIcon, path: '/transactions' },
    { name: 'Goals', icon: Target, path: '/goals' },
    { name: 'Insights', icon: BrainCircuit, path: '/insights' },
    { name: 'Financial Bot', icon: MessageSquare, path: '/bot' },
    { name: 'Profile', icon: UserIcon, path: '/profile' },
  ];

  return (
    <aside className="hidden lg:flex w-64 glass flex-col h-[calc(100vh-3rem)] m-6 rounded-2xl fixed top-0 left-0 z-50 p-6 overflow-hidden">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-8 h-8 rounded-lg neon-bg-magenta flex items-center justify-center">
          <Zap className="text-white fill-white" size={18} />
        </div>
        <span className="text-xl font-bold tracking-tight">NEON<span className="text-white/40 font-light">FIN</span></span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => 
              isActive ? 'sidebar-link-active' : 'sidebar-link'
            }
          >
            <item.icon size={18} />
            <span className="text-sm font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="space-y-6 mt-auto">
        <div className="glass p-4 rounded-xl border-white/5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">AI Health</span>
            <span className="text-xs text-cyan-400 font-mono">84%</span>
          </div>
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-[#00f2ff] shadow-[0_0_8px_#00f2ff]" style={{ width: '84%' }}></div>
          </div>
        </div>

        <button 
          onClick={logout}
          className="sidebar-link w-full text-red-400/60 hover:text-red-400 hover:bg-red-500/5 !py-2"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Terminate Session</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
