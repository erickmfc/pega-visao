import { Package, Navigation, AlertTriangle, Check, Camera } from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';
import { doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useFirebase } from '../lib/FirebaseProvider';

export type DeliveryStatus = 'PENDENTE' | 'ENTREGUE' | 'PROBLEMA';

interface DeliveryCardProps {
  id: string;
  address: string;
  status: DeliveryStatus;
  priority?: string;
  notes?: string;
  onNavigate?: (delivery: { id: string, address: string }) => void;
}

export default function DeliveryCard({ id, address, status, priority, notes, onNavigate }: DeliveryCardProps) {
  const { user } = useFirebase();
  const isPending = status === 'PENDENTE';
  const isDone = status === 'ENTREGUE';
  const isProblem = status === 'PROBLEMA';

  const handleCamera = (e: React.MouseEvent) => {
    e.stopPropagation();
    alert("Câmera desativada no modo de testes. Favor usar o botão FINALIZAR.");
  };

  const handleProblem = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Deseja reportar um problema com esta entrega?")) {
      const deliveryRef = doc(db, 'deliveries', id);
      updateDoc(deliveryRef, {
        status: 'PROBLEMA',
        updatedAt: serverTimestamp()
      }).catch(e => handleFirestoreError(e, OperationType.UPDATE, 'deliveries'));
    }
  };

  const markAsDelivered = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    try {
      const deliveryRef = doc(db, 'deliveries', id);
      await updateDoc(deliveryRef, {
        status: 'ENTREGUE',
        updatedAt: serverTimestamp()
      });

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        currentEarnings: increment(12.50), 
        totalDeliveries: increment(1)
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'deliveries/users');
    }
  };

  const openMap = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onNavigate) {
      onNavigate({ id, address });
    } else {
      const encodedAddress = encodeURIComponent(address);
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
    }
  };

  return (
    <motion.div 
      layout
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      className={`relative bg-white rounded-3xl p-3 border border-gray-100 shadow-xl flex flex-col gap-3 transition-opacity ${isDone ? 'opacity-40' : 'opacity-100'}`}
    >
      {priority === 'alta' && !isDone && (
        <div className="absolute top-3 right-3 bg-red-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter shadow-lg shadow-red-500/20 z-10">
          URGENTE
        </div>
      )}

      <div className="flex gap-3 items-center">
        <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 border border-primary/5">
          <Package className={`w-5 h-5 ${isDone ? 'text-gray-300' : 'text-primary-dark'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className={`text-[8px] font-lexend font-black tracking-widest uppercase px-1.5 py-0.5 rounded-md ${isProblem ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400'}`}>
              #{id.slice(-5).toUpperCase()}
            </span>
            {isDone && <Check className="w-3 h-3 text-emerald-500" />}
          </div>
          <h3 className={`font-sans font-bold text-sm ${isDone ? 'line-through text-gray-400' : 'text-slate-900'} truncate leading-tight`}>
            {address}
          </h3>
        </div>
        {!isDone && (
           <button onClick={handleCamera} className="w-9 h-9 bg-blue-50 hover:bg-blue-100 rounded-xl text-blue-500 active:scale-90 transition-all flex items-center justify-center shadow-sm">
             <Camera className="w-4 h-4" />
           </button>
        )}
      </div>

      {!isDone && (
        <div className="flex gap-2">
          {isPending && (
            <>
              <button 
                onClick={openMap}
                className="flex-[1.5] bg-primary hover:bg-primary-dark text-primary-dark font-display font-black text-xs py-3 rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/30 border border-white/20"
              >
                <Navigation className="w-4 h-4" />
                INICIAR
              </button>
              <button 
                onClick={markAsDelivered}
                className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-display font-black text-[10px] py-3 rounded-2xl active:scale-95 transition-all flex items-center justify-center border border-emerald-100/50"
              >
                FINALIZAR
              </button>
            </>
          )}
          {isProblem && (
            <button 
              onClick={handleProblem}
              className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-display font-black text-[9px] py-2 rounded-lg active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-red-100"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              RESOLVER
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
