import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Fuel, 
  Wallet, 
  Navigation, 
  Bike, 
  Car, 
  Clock, 
  ChevronRight, 
  Edit3, 
  Plus, 
  Info,
  ArrowUpRight,
  X
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  limit, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useFirebase } from '../lib/FirebaseProvider';

interface VehicleData {
  averageKmPerLiter: number;
  type: string;
}

export default function RouteSummary({ onDone }: { onDone: () => void }) {
  const { user } = useFirebase();
  const [vehicle, setVehicle] = useState<VehicleData | null>(null);
  const [loading, setLoading] = useState(true);

  // Sample data as requested in the mockup
  const fuelPrice = 6.00;
  const optimizedDistance = 42.5;
  const commonDistance = 49.3;
  const totalReceived = 85.00;
  const deliveryCount = 5;

  useEffect(() => {
    async function fetchVehicle() {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'vehicles'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(1)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          setVehicle(snap.docs[0].data() as VehicleData);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchVehicle();
  }, [user]);

  if (loading) return null;

  // Calculations
  const kmL = vehicle?.averageKmPerLiter || 35;
  const litersUsed = optimizedDistance / kmL;
  const fuelCost = litersUsed * fuelPrice;
  const netProfit = totalReceived - fuelCost;

  const kmSaved = commonDistance - optimizedDistance;
  const litersSaved = kmSaved / kmL;
  const moneySaved = litersSaved * fuelPrice;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed inset-0 bg-gray-50 z-[100] flex flex-col pb-12 overflow-y-auto"
    >
      {/* Header */}
      <div className="bg-primary p-8 pt-12 pb-10 rounded-b-[3rem] shadow-xl shadow-primary/10 relative">
        <button 
          onClick={onDone}
          className="absolute top-6 right-6 p-2 bg-white/20 rounded-full text-primary-dark backdrop-blur-md active:scale-90 transition-all border border-white/30"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-display font-black text-primary-dark tracking-tighter">RESUMO DA ROTA</h1>
            <p className="text-[10px] font-lexend font-black text-primary-dark/60 uppercase tracking-widest">Performance Finalizada</p>
          </div>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md"
          >
            {vehicle?.type === 'Carro' ? <Car className="w-6 h-6 text-primary-dark" /> : <Bike className="w-6 h-6 text-primary-dark" />}
          </motion.div>
        </div>
        
        <div className="mt-8 bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-white/50 shadow-sm">
          <p className="text-[10px] font-lexend font-black text-gray-400 uppercase tracking-widest mb-1">Resultado do dia</p>
          <p className="text-sm font-medium text-gray-700 leading-snug">
            Hoje você fez <span className="text-primary-dark font-black">{deliveryCount} entregas</span>, rodou <span className="font-bold">{optimizedDistance} km</span>, gastou cerca de <span className="font-bold text-red-500">R$ {fuelCost.toFixed(2)}</span> em combustível e teve um lucro estimado de <span className="text-emerald-600 font-black italic">R$ {netProfit.toFixed(2)}</span>.
          </p>
        </div>
      </div>

      <div className="px-6 -mt-6 space-y-4 pb-24">
        
        {/* Grid of Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <MetricCard 
            icon={Navigation} 
            label="Distância" 
            value={`${optimizedDistance} km`} 
            color="bg-blue-50 text-blue-600"
          />
          <MetricCard 
            icon={Fuel} 
            label="Litros Gastos" 
            value={`${litersUsed.toFixed(2)} L`} 
            color="bg-amber-50 text-amber-600"
          />
          <MetricCard 
            icon={Wallet} 
            label="Total Bruto" 
            value={`R$ ${totalReceived.toFixed(2)}`} 
            color="bg-purple-50 text-purple-600"
          />
          <MetricCard 
            icon={TrendingUp} 
            label="Lucro Real" 
            value={`R$ ${netProfit.toFixed(2)}`} 
            color="bg-emerald-50 text-emerald-600"
            highlight
          />
        </div>

        {/* Economy Highlight */}
        <div className="bg-primary/5 border border-primary/20 p-5 rounded-[2rem] relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-3xl" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <ArrowUpRight className="w-5 h-5 text-primary-dark" />
            </div>
            <div>
              <h3 className="text-[11px] font-lexend font-black text-primary-dark uppercase tracking-widest">Economia Otimizada</h3>
              <p className="text-[9px] text-gray-500">Comparado a uma rota comum</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <p className="text-[8px] font-bold text-gray-400 uppercase">Km</p>
              <p className="text-sm font-black text-primary-dark">{kmSaved.toFixed(1)}</p>
            </div>
            <div className="text-center border-x border-primary/10">
              <p className="text-[8px] font-bold text-gray-400 uppercase">Litros</p>
              <p className="text-sm font-black text-primary-dark">{litersSaved.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-[8px] font-bold text-gray-400 uppercase">Dinheiro</p>
              <p className="text-sm font-black text-emerald-600">R$ {moneySaved.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button 
            onClick={onDone}
            className="w-full bg-primary text-primary-dark font-display font-black py-4 rounded-2xl shadow-xl shadow-primary/10 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            NOVA ROTA
          </button>
          
          <div className="flex gap-3">
            <button className="flex-1 bg-white border border-gray-100 text-gray-600 font-bold text-[10px] py-4 rounded-2xl flex items-center justify-center gap-2">
              <Info className="w-4 h-4" />
              DETALHES
            </button>
            <button className="flex-1 bg-white border border-gray-100 text-gray-600 font-bold text-[10px] py-4 rounded-2xl flex items-center justify-center gap-2">
              <Edit3 className="w-4 h-4" />
              VEÍCULO
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MetricCard({ icon: Icon, label, value, color, highlight }: { 
  icon: any, 
  label: string, 
  value: string, 
  color: string,
  highlight?: boolean 
}) {
  return (
    <div className={`bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col gap-3 ${highlight ? 'ring-2 ring-primary/20' : ''}`}>
      <div className={`w-8 h-8 ${color} rounded-xl flex items-center justify-center`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-[8px] font-lexend font-black text-gray-400 uppercase tracking-widest">{label}</p>
        <p className={`text-base font-display font-black tracking-tight ${highlight ? 'text-emerald-600 italic' : 'text-gray-800'}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
