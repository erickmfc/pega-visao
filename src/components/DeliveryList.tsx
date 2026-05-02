import { motion, useDragControls } from 'motion/react';
import DeliveryCard, { DeliveryStatus } from './DeliveryCard';

const deliveries: { id: string, address: string, status: DeliveryStatus }[] = [
  { id: '10293', address: 'Av. Paulista, 1578', status: 'PENDENTE' },
  { id: '10290', address: 'Rua Augusta, 500', status: 'ENTREGUE' },
  { id: '10295', address: 'Rua Consolação, 2000', status: 'PROBLEMA' },
  { id: '10298', address: 'Al. Santos, 1202', status: 'PENDENTE' },
];

export default function DeliveryList() {
  return (
    <motion.div 
      initial={{ y: '70%' }}
      animate={{ y: '20%' }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 800 }}
      className="absolute bottom-0 left-0 right-0 z-30 flex flex-col items-center pointer-events-none"
    >
      {/* Handle container */}
      <div className="w-12 h-1.5 bg-surface-highest rounded-full mb-3 shadow-sm opacity-50" />
      
      {/* List Container */}
      <div className="w-full max-w-lg bg-surface-lowest rounded-t-[32px] shadow-[0_-12px_40px_rgba(0,0,0,0.1)] pointer-events-auto flex flex-col h-[80vh] border-t border-surface-highest">
        
        {/* Header section of bottom sheet */}
        <div className="px-8 py-5 border-b border-surface-low flex justify-between items-center bg-white rounded-t-[32px] sticky top-0 z-10">
          <h2 className="font-display font-bold text-xl text-on-surface">Rota Atual</h2>
          <div className="bg-primary px-3 py-1 rounded-full shadow-sm">
            <span className="text-[10px] font-lexend font-bold text-primary-dark">12 MIN</span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-4 flex flex-col gap-4 pb-24 touch-pan-y">
          {deliveries.map((delivery) => (
            <DeliveryCard key={delivery.id} {...delivery} />
          ))}
          
          <div className="mt-4 p-4 rounded-xl border-2 border-dashed border-surface-high flex flex-col items-center justify-center gap-2 opacity-60">
            <p className="text-xs font-lexend font-medium text-gray-400">Fim da rota atual</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
