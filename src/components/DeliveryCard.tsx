import { Clock, CheckCircle2, AlertCircle, Navigation, Info, AlertTriangle, Check } from 'lucide-react';
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
}

export default function DeliveryCard({ id, address, status, priority, notes }: DeliveryCardProps) {
  const { user } = useFirebase();
  const isPending = status === 'PENDENTE';
  const isDone = status === 'ENTREGUE';
  const isProblem = status === 'PROBLEMA';

  const openMap = () => {
    const encodedAddress = encodeURIComponent(address);
    // Try to open Google Maps or Waze, fallback to standard web link
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
  };

  const markAsDelivered = async () => {
    if (!user) return;
    try {
      const deliveryRef = doc(db, 'deliveries', id);
      await updateDoc(deliveryRef, {
        status: 'ENTREGUE',
        updatedAt: serverTimestamp()
      });

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        currentEarnings: increment(15.50), // Sample amount per delivery
        totalDeliveries: increment(1)
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'deliveries/users');
    }
  };

  return (
    <div 
      className={`relative bg-white rounded-xl p-4 border border-surface-highest shadow-sm flex flex-col gap-3 transition-opacity ${isDone ? 'opacity-60' : 'opacity-100'}`}
    >
      {priority === 'alta' && !isDone && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] font-black px-2 py-1 rounded-full shadow-lg z-10 animate-bounce">
          ALTA PRIORIDADE
        </div>
      )}

      <div className="flex justify-between items-start">
        <div>
          <span className={`text-[10px] font-lexend font-bold tracking-widest ${isProblem ? 'text-red-500' : 'text-on-surface-variant'}`}>
            PEDIDO #{id.slice(-5)}
          </span>
          <h3 className={`font-sans font-bold text-base mt-0.5 ${isDone ? 'line-through text-gray-400' : 'text-on-surface'}`}>
            {address}
          </h3>
          {notes && !isDone && (
            <p className="text-[10px] text-gray-500 mt-1 italic leading-tight">
              "{notes}"
            </p>
          )}
        </div>
        
        <div className={`flex items-center gap-1 px-2 py-1 rounded border text-[10px] font-lexend font-bold ${
          isPending ? 'bg-surface-high border-surface-highest text-gray-500' :
          isDone ? 'bg-green-50 border-green-100 text-green-600' :
          'bg-red-50 border-red-100 text-red-600'
        }`}>
          {isPending && <Clock className="w-3 h-3" />}
          {isDone && <CheckCircle2 className="w-3 h-3" />}
          {isProblem && <AlertCircle className="w-3 h-3" />}
          {status}
        </div>
      </div>

      {!isDone && (
        <div className="flex gap-3">
          {isPending && (
            <>
              <button 
                onClick={markAsDelivered}
                className="flex-[3] bg-emerald-500 hover:bg-emerald-600 text-white font-display font-black text-lg py-5 rounded-3xl active:scale-95 transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20"
              >
                <Check className="w-6 h-6" />
                ENTREGAR
              </button>
              <button 
                onClick={openMap}
                className="flex-1 bg-surface-low hover:bg-surface-high text-on-surface p-5 rounded-3xl active:scale-95 transition-all flex items-center justify-center border border-surface-highest"
              >
                <Navigation className="w-6 h-6 text-primary-dark" />
              </button>
            </>
          )}
          {isProblem && (
            <button className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-display font-black text-lg py-5 rounded-3xl active:scale-95 transition-all flex items-center justify-center gap-3 border border-red-100 shadow-sm">
              <AlertTriangle className="w-6 h-6" />
              REPORTAR
            </button>
          )}
        </div>
      )}
    </div>
  );
}
