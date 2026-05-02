import { motion } from 'motion/react';
import DeliveryCard from './DeliveryCard';
import { useFirebase } from '../lib/FirebaseProvider';

interface DeliveryListProps {
  onFinishRoute?: () => void;
  onNavigate?: (delivery: { id: string, address: string }) => void;
}

export default function DeliveryList({ onFinishRoute, onNavigate }: DeliveryListProps) {
  const { deliveries } = useFirebase();

  return (
    <motion.div 
      initial={{ y: '90%' }}
      animate={{ y: '35%' }}
      drag="y"
      dragConstraints={{ top: -500, bottom: 650 }}
      dragElastic={0.15}
      dragTransition={{ bounceStiffness: 400, bounceDamping: 30 }}
      className="absolute bottom-0 left-0 right-0 z-30 flex flex-col items-center pointer-events-auto group"
    >
      <div className="w-16 h-1.5 bg-gray-300 rounded-full mb-3 shadow-md border border-white/20 pointer-events-auto cursor-grab active:cursor-grabbing" />
      
      <div className="w-full max-w-lg bg-white/95 backdrop-blur-3xl rounded-t-[3rem] shadow-[0_-20px_60px_rgba(0,0,0,0.15)] pointer-events-auto flex flex-col h-[92vh] border-t border-gray-100 overflow-hidden">
        
        <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center bg-white/50 rounded-t-[2.5rem] sticky top-0 z-10">
          <div>
            <h2 className="font-display font-black italic text-lg text-primary-dark tracking-tight">ROTA ATIVA</h2>
            <p className="text-[7px] font-lexend font-black text-gray-400 uppercase tracking-[0.2em] -mt-1">Trajeto em tempo real</p>
          </div>
          <div className="bg-primary/20 px-3 py-1.5 rounded-full border border-primary/20">
            <span className="text-[9px] font-lexend font-black text-primary-dark tracking-tighter">
              {deliveries.filter(d => d.status === 'PENDENTE').length} PENDENTES
            </span>
          </div>
          {deliveries.length > 0 && onFinishRoute && (
            <button 
              onClick={onFinishRoute}
              className="ml-2 bg-primary-dark text-white text-[8px] font-black px-3 py-2 rounded-lg active:scale-95 transition-all shadow-lg shadow-black/10"
            >
              FINALIZAR
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 pb-40 touch-pan-y no-scrollbar">
          {deliveries.length > 0 ? (
            deliveries.map((delivery, index) => {
              const isFirstPending = index === deliveries.findIndex(d => d.status === 'PENDENTE');
              return (
                <div key={delivery.id} className={isFirstPending ? 'scale-[1.01] transition-all' : ''}>
                  {isFirstPending && (
                    <div className="flex items-center gap-1.5 mb-1 ml-1">
                      <div className="w-1 h-1 rounded-full bg-primary" />
                      <span className="text-[8px] font-lexend font-black text-gray-400 uppercase tracking-[0.2em]">
                        Próxima
                      </span>
                    </div>
                  )}
                  <DeliveryCard {...delivery} onNavigate={onNavigate} />
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-20 opacity-40">
              <p className="font-lexend font-bold text-gray-400">Nenhuma entrega no radar</p>
            </div>
          )}
          
          <div className="mt-4 p-4 rounded-xl border-2 border-dashed border-surface-high flex flex-col items-center justify-center gap-2 opacity-60">
            <p className="text-xs font-lexend font-medium text-gray-400">Fim da rota atual</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
