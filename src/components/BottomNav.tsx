import { Map as MapIcon, Users, Wallet, User } from 'lucide-react';
import { motion } from 'motion/react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'mapa', label: 'MAPA', icon: MapIcon },
    { id: 'comunidade', label: 'COMUNIDADE', icon: Users },
    { id: 'ganhos', label: 'GANHOS', icon: Wallet },
    { id: 'perfil', label: 'PERFIL', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-surface-highest px-4 pt-3 pb-8 flex justify-around items-center rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.05)]">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="relative flex flex-col items-center justify-center min-w-[72px] transition-all"
          >
            {isActive && (
              <motion.div
                layoutId="nav-pill"
                className="absolute inset-0 bg-primary rounded-2xl -z-10 h-10 mt-1 shadow-lg shadow-primary/30"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            
            <Icon
              className={`w-6 h-6 transition-colors duration-300 ${
                isActive ? 'text-primary-dark translate-y-[-2px]' : 'text-gray-400'
              }`}
              style={isActive ? { fill: 'currentColor' } : {}}
            />
            
            <span
              className={`text-[10px] font-display font-bold tracking-widest mt-1.5 transition-colors duration-300 ${
                isActive ? 'text-primary-dark' : 'text-gray-400'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
