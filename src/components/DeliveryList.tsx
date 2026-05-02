import { motion } from 'motion/react';
import DeliveryCard from './DeliveryCard';
import { useFirebase } from '../lib/FirebaseProvider';

export default function DeliveryList() {
  const { deliveries } = useFirebase();

  return (
    <motion.div 
      initial={{ y: '70%' }}
      animate={{ y: '20%' }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 800 }}
      className="absolute bottom-0 left-0 right-0 z-30 flex flex-col items-center pointer-events-none"
    >
      <div className="w-12 h-1.5 bg-surface-highest rounded-full mb-3 shadow-sm opacity-50" />
      
      <div className="w-full max-w-lg bg-surface-lowest rounded-t-[32px] shadow-[0_-12px_40px_rgba(0,0,0,0.1)] pointer-events-auto flex flex-col h-[80vh] border-t border-surface-highest">
        
        <div className="px-8 py-5 border-b border-surface-low flex justify-between items-center bg-white rounded-t-[32px] sticky top-0 z-10">
          <h2 className="font-display font-bold text-xl text-on-surface">Rota Atual</h2>
          <div className="bg-primary px-3 py-1 rounded-full shadow-sm">
            <span className="text-[10px] font-lexend font-bold text-primary-dark">{deliveries.filter(d => d.status === 'PENDENTE').length} PENDENTES</span>
          </div>
        </div>

        <div className="overflow-y-auto p-4 flex flex-col gap-4 pb-24 touch-pan-y">
          {deliveries.length > 0 ? (
            deliveries.map((delivery, index) => {
              const isFirstPending = index === deliveries.findIndex(d => d.status === 'PENDENTE');
              return (
                <div key={delivery.id} className={isFirstPending ? 'scale-[1.02] -rotate-1 ring-4 ring-primary/20 rounded-2xl z-10 transition-all' : ''}>
                  {isFirstPending && (
                    <div className="bg-primary text-primary-dark text-[10px] font-black px-3 py-1 rounded-t-xl inline-block ml-4 shadow-sm">
                      PRÓXIMA PARADA
                    </div>
                  )}
                  <DeliveryCard {...delivery} />
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
