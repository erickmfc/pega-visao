import React from 'react';
import { Plus, ListFilter, MapPin, Gauge } from 'lucide-react';
import { motion } from 'motion/react';

interface QuickActionsProps {
  onAddDelivery: () => void;
  onShowStats: () => void;
}

export default function QuickActions({ onAddDelivery, onShowStats }: QuickActionsProps) {
  return (
    <div className="flex gap-2 w-full justify-center">
      <motion.button 
        whileTap={{ scale: 0.95 }}
        onClick={onAddDelivery}
        className="flex-1 max-w-[140px] h-14 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-black/5 border border-white flex flex-col items-center justify-center gap-1 group relative overflow-hidden pointer-events-auto"
      >
        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors" />
        <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 text-primary-dark" />
        </div>
        <span className="text-[8px] font-lexend font-black text-gray-500 uppercase tracking-widest leading-none">Novo Pega</span>
      </motion.button>

      <motion.button 
        whileTap={{ scale: 0.95 }}
        onClick={onShowStats}
        className="flex-1 max-w-[140px] h-14 bg-primary-dark/95 backdrop-blur-xl rounded-2xl shadow-xl shadow-black/10 border border-white/5 flex flex-col items-center justify-center gap-1 group relative overflow-hidden pointer-events-auto"
      >
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors" />
        <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
          <Gauge className="w-4 h-4 text-primary-dark" />
        </div>
        <span className="text-[8px] font-lexend font-black text-primary uppercase tracking-widest leading-none">Resumo</span>
      </motion.button>
    </div>
  );
}
