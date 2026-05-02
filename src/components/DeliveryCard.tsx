import { Clock, CheckCircle2, AlertCircle, Navigation, Info, AlertTriangle } from 'lucide-react';

export type DeliveryStatus = 'PENDENTE' | 'ENTREGUE' | 'PROBLEMA';

interface DeliveryCardProps {
  id: string;
  address: string;
  status: DeliveryStatus;
}

export default function DeliveryCard({ id, address, status }: DeliveryCardProps) {
  const isPending = status === 'PENDENTE';
  const isDone = status === 'ENTREGUE';
  const isProblem = status === 'PROBLEMA';

  return (
    <div 
      className={`relative bg-white rounded-xl p-4 border border-surface-highest shadow-sm flex flex-col gap-3 transition-opacity ${isDone ? 'opacity-60' : 'opacity-100'}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <span className={`text-[10px] font-lexend font-bold tracking-widest ${isProblem ? 'text-red-500' : 'text-on-surface-variant'}`}>
            PEDIDO #{id}
          </span>
          <h3 className={`font-sans font-bold text-base mt-0.5 ${isDone ? 'line-through text-gray-400' : 'text-on-surface'}`}>
            {address}
          </h3>
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
        <div className="flex gap-2">
          {isPending && (
            <>
              <button className="flex-1 bg-primary hover:bg-primary-dark text-on-surface-variant font-bold text-sm py-2.5 rounded-lg active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm">
                <Navigation className="w-4 h-4" />
                GPS
              </button>
              <button className="flex-1 bg-surface-low hover:bg-surface-high text-on-surface font-bold text-sm py-2.5 rounded-lg active:scale-95 transition-all flex items-center justify-center gap-2 border border-surface-highest">
                <Info className="w-4 h-4" />
                Detalhes
              </button>
            </>
          )}
          {isProblem && (
            <button className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm py-2.5 rounded-lg active:scale-95 transition-all flex items-center justify-center gap-2 border border-red-100 shadow-sm">
              <AlertTriangle className="w-4 h-4" />
              Reportar Problema
            </button>
          )}
        </div>
      )}
    </div>
  );
}
