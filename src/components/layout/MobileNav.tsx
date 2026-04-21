import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  History as HistoryIcon, 
  PieChart, 
  Target, 
  User as UserIcon,
  BrainCircuit,
  MessageSquare
} from 'lucide-react';

const MobileNav = () => {
  const navItems = [
    { name: 'Dash', icon: LayoutDashboard, path: '/' },
    { name: 'Charts', icon: PieChart, path: '/analytics' },
    { name: 'AI', icon: BrainCircuit, path: '/insights' },
    { name: 'Goals', icon: Target, path: '/goals' },
    { name: 'Profile', icon: UserIcon, path: '/profile' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-4 left-4 right-4 h-16 glass rounded-2xl z-50 flex items-center justify-around px-2 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      {navItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          className={({ isActive }) => 
            `flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-xl transition-all ${
              isActive 
                ? 'text-[#00f2ff] bg-white/5 shadow-[0_0_10px_rgba(0,242,255,0.1)] border border-cyan-400/20' 
                : 'text-white/40'
            }`
          }
        >
          <item.icon size={20} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">{item.name}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default MobileNav;
