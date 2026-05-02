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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-100 px-6 pt-2 pb-6 flex justify-between items-center rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex flex-col items-center justify-center p-2 rounded-2xl transition-all active:scale-90"
          >
            <div className={`p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary shadow-lg shadow-primary/20' : ''}`}>
              <Icon
                className={`w-5 h-5 transition-colors duration-300 ${
                  isActive ? 'text-primary-dark' : 'text-gray-400'
                }`}
              />
            </div>
            
            <span
              className={`text-[8px] font-lexend font-black tracking-widest mt-1 transition-colors duration-300 ${
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
