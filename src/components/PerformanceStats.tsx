import React from 'react';
import { TrendingUp, Clock, Zap, MapPin } from 'lucide-react';

export default function PerformanceStats() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-display font-black italic tracking-tighter text-on-surface">PERFORMANCE HOJE</h4>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[8px] font-lexend font-black text-emerald-600 uppercase">Acima da média</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-[8px] font-lexend font-black text-gray-400 uppercase tracking-widest">Tempo Médio</span>
            </div>
            <p className="text-xl font-display font-black italic text-on-surface">18 min</p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <span className="text-[8px] font-lexend font-black text-gray-400 uppercase tracking-widest">Ganhos/Hora</span>
            </div>
            <p className="text-xl font-display font-black italic text-on-surface">R$ 38,50</p>
          </div>
        </div>

        <div className="h-[1px] bg-gray-50 flex items-center justify-center">
          <div className="px-3 bg-white text-[8px] font-lexend font-black text-gray-300 uppercase tracking-widest">Timeline</div>
        </div>

        <div className="space-y-4">
          {[
            { hour: '14h', value: 'R$ 22,00', icon: MapPin },
            { hour: '15h', value: 'R$ 45,00', icon: TrendingUp },
            { hour: '16h', value: 'R$ 31,50', icon: MapPin },
          ].map((item, i) => (
             <div key={i} className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <span className="text-[10px] font-lexend font-bold text-gray-400 w-8">{item.hour}</span>
                 <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                 <span className="text-[10px] font-bold text-on-surface">Ciclo de entregas #{i+1}</span>
               </div>
               <span className="text-[10px] font-black text-emerald-600 italic">{item.value}</span>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}
