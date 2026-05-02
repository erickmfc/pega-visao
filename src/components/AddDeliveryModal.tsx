import { useState } from 'react';
import { X, Package, MapPin, Scale, AlertCircle, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useFirebase } from '../lib/FirebaseProvider';

interface AddDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddDeliveryModal({ isOpen, onClose }: AddDeliveryModalProps) {
  const { user } = useFirebase();
  const [formData, setFormData] = useState({
    orderId: '',
    address: '',
    weight: '',
    notes: '',
    priority: 'normal'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await addDoc(collection(db, 'deliveries'), {
        userId: user.uid,
        orderId: formData.orderId || `M-${Math.floor(Math.random() * 10000)}`,
        address: formData.address,
        weight: formData.weight,
        notes: formData.notes,
        priority: formData.priority,
        status: 'PENDENTE',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      onClose();
      setFormData({ orderId: '', address: '', weight: '', notes: '', priority: 'normal' });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'deliveries');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="relative w-full max-w-lg bg-surface-lowest rounded-t-[32px] sm:rounded-[32px] p-8 shadow-2xl overflow-hidden"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-display font-black text-on-surface">NOVO PEDIDO</h2>
              <button onClick={onClose} className="p-2 bg-surface-low rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-lexend font-bold text-gray-400 uppercase tracking-widest pl-1">Endereço de Entrega</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    required
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Ex: Av. Paulista, 1000"
                    className="w-full bg-surface-low border-2 border-transparent focus:border-primary p-4 pl-12 rounded-2xl outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-lexend font-bold text-gray-400 uppercase tracking-widest pl-1">Pedido # (Opcional)</label>
                  <div className="relative">
                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      value={formData.orderId}
                      onChange={e => setFormData({ ...formData, orderId: e.target.value })}
                      placeholder="123456"
                      className="w-full bg-surface-low border-2 border-transparent focus:border-primary p-4 pl-12 rounded-2xl outline-none transition-all font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-lexend font-bold text-gray-400 uppercase tracking-widest pl-1">Peso (kg)</label>
                  <div className="relative">
                    <Scale className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      value={formData.weight}
                      onChange={e => setFormData({ ...formData, weight: e.target.value })}
                      placeholder="2.5"
                      className="w-full bg-surface-low border-2 border-transparent focus:border-primary p-4 pl-12 rounded-2xl outline-none transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-lexend font-bold text-gray-400 uppercase tracking-widest pl-1">Prioridade</label>
                <div className="flex gap-2">
                  {['baixa', 'normal', 'alta'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: p })}
                      className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase border-2 transition-all ${
                        formData.priority === p 
                          ? 'bg-primary/10 border-primary text-primary-dark' 
                          : 'bg-surface-low border-transparent text-gray-400'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-lexend font-bold text-gray-400 uppercase tracking-widest pl-1">Observações</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ex: Deixar na portaria, falar com Sr. João..."
                  rows={3}
                  className="w-full bg-surface-low border-2 border-transparent focus:border-primary p-4 rounded-2xl outline-none transition-all font-medium resize-none text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-on-surface-variant font-display font-black py-5 rounded-2xl shadow-xl shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
              >
                <Plus className="w-6 h-6" />
                ADICIONAR ROTA
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
