import { useState } from 'react';
import { motion } from 'motion/react';
import { Bike, Car, ArrowRight, Gauge, Fuel, Container, Tag, Calendar, CheckCircle2 } from 'lucide-react';
import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useFirebase } from '../lib/FirebaseProvider';

export default function VehicleRegistration() {
  const { user } = useFirebase();
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'Moto' as 'Moto' | 'Carro',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    averageKmPerLiter: '',
    fuelType: 'Gasolina',
    tankCapacityLiters: '',
    nickname: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.brand) newErrors.brand = 'Marca é obrigatória';
    if (!formData.model) newErrors.model = 'Modelo é obrigatório';
    if (!formData.year || formData.year < 1900) newErrors.year = 'Ano inválido';
    if (!formData.averageKmPerLiter || Number(formData.averageKmPerLiter) <= 0) 
      newErrors.averageKmPerLiter = 'Consumo deve ser maior que 0';
    if (!formData.tankCapacityLiters || Number(formData.tankCapacityLiters) <= 0)
      newErrors.tankCapacityLiters = 'Capacidade deve ser maior que 0';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !user) return;
    
    setIsSaving(true);
    try {
      // 1. Create vehicle record
      await addDoc(collection(db, 'vehicles'), {
        userId: user.uid,
        ...formData,
        averageKmPerLiter: Number(formData.averageKmPerLiter),
        tankCapacityLiters: Number(formData.tankCapacityLiters),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // 2. Update user profile to mark registration as complete
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { hasVehicleRegistered: true }, { merge: true });

      setSuccess(true);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'vehicles');
    } finally {
      setIsSaving(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle2 className="w-12 h-12" />
        </motion.div>
        <h2 className="text-2xl font-display font-black text-on-surface mb-2 tracking-tight">CADASTRO CONCLUÍDO!</h2>
        <p className="text-gray-500 font-lexend text-sm max-w-[280px]">
          Veículo cadastrado com sucesso. Agora vamos calcular suas rotas com mais precisão.
        </p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => window.location.reload()}
          className="mt-12 w-full max-w-xs bg-primary text-primary-dark font-display font-black py-4 rounded-2xl shadow-xl shadow-primary/20"
        >
          IR PARA O MAPA
        </motion.button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="p-8 pb-4">
        <h1 className="text-3xl font-display font-black text-on-surface leading-tight tracking-tighter">
          CADASTRE SEU <br /> <span className="text-primary-dark">VEÍCULO</span>
        </h1>
        <p className="text-gray-400 text-[10px] font-lexend font-bold uppercase tracking-widest mt-2">
          Passo 01: Configurações de Custo
        </p>
        <p className="text-gray-500 text-xs mt-4 font-medium leading-relaxed">
          Essas informações ajudam o Pega Visão a calcular seus custos, lucro real e economia nas rotas.
        </p>
      </div>

      <div className="flex-1 px-6 pb-12">
        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100 flex flex-col gap-6">
          
          {/* Type Selector */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'Moto', icon: Bike, label: 'MOTOCICLETA' },
              { id: 'Carro', icon: Car, label: 'AUTOMÓVEL' }
            ].map((v) => {
              const Icon = v.icon;
              const isActive = formData.type === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setFormData({ ...formData, type: v.id as any })}
                  className={`flex flex-col items-center gap-3 p-5 rounded-3xl border-2 transition-all duration-300 ${
                    isActive 
                      ? 'bg-primary/5 border-primary text-primary-dark shadow-inner' 
                      : 'bg-gray-50 border-transparent text-gray-400 opacity-60'
                  }`}
                >
                  <Icon className={`w-8 h-8 ${isActive ? 'scale-110' : ''} transition-transform`} />
                  <span className="text-[9px] font-black tracking-widest">{v.label}</span>
                </button>
              );
            })}
          </div>

          <div className="space-y-5">
            {/* Marca e Modelo */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[8px] font-lexend font-black text-gray-400 uppercase tracking-widest px-1">Marca</label>
                <input
                  value={formData.brand}
                  onChange={e => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="Ex: Honda"
                  className={`w-full bg-gray-50 border ${errors.brand ? 'border-red-300' : 'border-gray-100'} p-3.5 rounded-xl text-xs font-bold outline-none focus:border-primary transition-all`}
                />
                {errors.brand && <p className="text-red-500 text-[8px] pl-1 font-bold">{errors.brand}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-lexend font-black text-gray-400 uppercase tracking-widest px-1">Modelo</label>
                <input
                  value={formData.model}
                  onChange={e => setFormData({ ...formData, model: e.target.value })}
                  placeholder="Ex: CG 160"
                  className={`w-full bg-gray-50 border ${errors.model ? 'border-red-300' : 'border-gray-100'} p-3.5 rounded-xl text-xs font-bold outline-none focus:border-primary transition-all`}
                />
                {errors.model && <p className="text-red-500 text-[8px] pl-1 font-bold">{errors.model}</p>}
              </div>
            </div>

            {/* Ano e Consumo */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[8px] font-lexend font-black text-gray-400 uppercase tracking-widest px-1">Ano</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
                  <input
                    type="number"
                    value={formData.year}
                    onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className={`w-full bg-gray-50 border ${errors.year ? 'border-red-300' : 'border-gray-100'} p-3.5 pl-10 rounded-xl text-xs font-bold outline-none focus:border-primary transition-all`}
                  />
                </div>
                {errors.year && <p className="text-red-500 text-[8px] pl-1 font-bold">{errors.year}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-lexend font-black text-gray-400 uppercase tracking-widest px-1">Consumo (km/L)</label>
                <div className="relative">
                  <Gauge className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
                  <input
                    type="number"
                    value={formData.averageKmPerLiter}
                    onChange={e => setFormData({ ...formData, averageKmPerLiter: e.target.value })}
                    placeholder="Ex: 35"
                    className={`w-full bg-gray-50 border ${errors.averageKmPerLiter ? 'border-red-300' : 'border-gray-100'} p-3.5 pl-10 rounded-xl text-xs font-bold outline-none focus:border-primary transition-all`}
                  />
                </div>
                {errors.averageKmPerLiter && <p className="text-red-500 text-[8px] pl-1 font-bold">{errors.averageKmPerLiter}</p>}
              </div>
            </div>

            {/* Combustível */}
            <div className="space-y-2">
              <label className="text-[8px] font-lexend font-black text-gray-400 uppercase tracking-widest px-1">Tipo de Combustível</label>
              <div className="flex gap-2">
                {['Gasolina', 'Etanol', 'Flex', 'Diesel'].map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFormData({ ...formData, fuelType: f })}
                    className={`flex-1 py-2.5 rounded-lg font-black text-[8px] uppercase border transition-all ${
                      formData.fuelType === f 
                        ? 'bg-primary border-primary text-primary-dark shadow-sm' 
                        : 'bg-gray-50 border-gray-100 text-gray-400'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Tanque e Apelido */}
            <div className="grid grid-cols-2 gap-3">
               <div className="space-y-1">
                <label className="text-[8px] font-lexend font-black text-gray-400 uppercase tracking-widest px-1">Tanque (Litros)</label>
                <div className="relative">
                  <Fuel className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
                  <input
                    type="number"
                    value={formData.tankCapacityLiters}
                    onChange={e => setFormData({ ...formData, tankCapacityLiters: e.target.value })}
                    placeholder="Ex: 14"
                    className={`w-full bg-gray-50 border ${errors.tankCapacityLiters ? 'border-red-300' : 'border-gray-100'} p-3.5 pl-10 rounded-xl text-xs font-bold outline-none focus:border-primary transition-all`}
                  />
                </div>
                {errors.tankCapacityLiters && <p className="text-red-500 text-[8px] pl-1 font-bold">{errors.tankCapacityLiters}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-lexend font-black text-gray-400 uppercase tracking-widest px-1">Apelido (Opcional)</label>
                <div className="relative">
                  <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
                  <input
                    value={formData.nickname}
                    onChange={e => setFormData({ ...formData, nickname: e.target.value })}
                    placeholder="Minha Nave"
                    className="w-full bg-gray-50 border border-gray-100 p-3.5 pl-10 rounded-xl text-xs font-bold outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>

          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`w-full bg-primary text-primary-dark font-display font-black py-4 rounded-2xl shadow-xl shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2 ${isSaving ? 'opacity-70 animate-pulse' : ''}`}
          >
            {isSaving ? 'SALVANDO...' : 'SALVAR VEÍCULO'}
            {!isSaving && <ArrowRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
