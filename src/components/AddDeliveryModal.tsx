import { useState, useEffect, useRef, FormEvent } from 'react';
import { X, Package, MapPin, Scale, Plus, Scan, Sparkles, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useFirebase } from '../lib/FirebaseProvider';
import { Html5Qrcode } from 'html5-qrcode';

interface AddDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddDeliveryModal({ isOpen, onClose }: AddDeliveryModalProps) {
  const { user } = useFirebase();
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [formData, setFormData] = useState({
    orderId: '',
    address: '',
    weight: '',
    notes: '',
    priority: 'normal'
  });

  useEffect(() => {
    if (isScanning && !scannerRef.current) {
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;
      
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      
      html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          // Processamento do texto escaneado
          try {
            // Tenta parsear como JSON (etiquetas inteligentes)
            const data = JSON.parse(decodedText);
            setFormData(prev => ({
              ...prev,
              orderId: data.id || data.orderId || prev.orderId,
              address: data.address || data.destinatario || prev.address,
              notes: data.notes || data.obs || prev.notes,
              weight: data.weight || prev.weight,
              priority: data.priority || 'alta'
            }));
          } catch (e) {
            // Se não for JSON, trata como texto simples (ex: apenas o ID do pedido ou endereço)
            if (decodedText.startsWith('http')) {
              // Poderia processar URLs específicas aqui
              setFormData(prev => ({ ...prev, orderId: decodedText.split('/').pop() || '' }));
            } else if (decodedText.length > 20) {
              setFormData(prev => ({ ...prev, address: decodedText }));
            } else {
              setFormData(prev => ({ ...prev, orderId: decodedText }));
            }
          }
          
          stopScanning();
        },
        (errorMessage) => {
          // Erros de scan silenciosos (acontecem enquanto busca o qr)
        }
      ).catch(err => {
        console.error("Erro ao iniciar camera:", err);
        setIsScanning(false);
      });
    }

    return () => {
      if (scannerRef.current) {
        stopScanning();
      }
    };
  }, [isScanning]);

  const stopScanning = () => {
    if (scannerRef.current) {
      if (scannerRef.current.isScanning) {
        scannerRef.current.stop().then(() => {
          scannerRef.current?.clear();
          scannerRef.current = null;
        }).catch(err => console.error("Erro ao parar scanner:", err));
      } else {
        scannerRef.current = null;
      }
    }
    setIsScanning(false);
  };

  const handleScanClick = () => {
    setIsScanning(true);
  };

  const handleSubmit = async (e: FormEvent) => {
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
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4 text-sm">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="relative w-full max-w-md bg-white rounded-t-[2rem] sm:rounded-[2rem] p-6 shadow-2xl overflow-hidden"
          >
            {isScanning && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="w-full max-w-[280px] aspect-square border-4 border-primary rounded-3xl relative overflow-hidden bg-gray-900 shadow-2xl">
                  <div id="reader" className="w-full h-full" />
                  <motion.div 
                    animate={{ y: [0, 280, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute w-full h-0.5 bg-primary shadow-[0_0_15px_rgba(255,215,0,1)] z-20"
                  />
                  <div className="absolute inset-0 border-[30px] border-black/60 pointer-events-none z-10" />
                </div>
                <h3 className="text-white font-display font-black text-lg mt-6 italic">ESCANEANDO ETIQUETA...</h3>
                <p className="text-white/60 text-[10px] mt-2 font-lexend">Centralize o QR ou Código de Barras</p>
                <button 
                  onClick={stopScanning}
                  className="mt-8 text-white/50 font-bold text-[10px] uppercase tracking-widest px-6 py-2 border border-white/10 rounded-full"
                >
                  CANCELAR
                </button>
              </motion.div>
            )}

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-display font-black text-on-surface">NOVO PEDIDO</h2>
              <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 active:scale-90 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <button 
                onClick={handleScanClick}
                className="w-full bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/10 text-white">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-tight">Escanear Etiqueta</p>
                    <p className="text-[9px] opacity-70">iFood, ML, Shopee e outros</p>
                  </div>
                </div>
                <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
              </button>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-lexend font-bold text-gray-400 uppercase tracking-widest pl-1">Endereço de Entrega</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      required
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Ex: Av. Paulista, 1000"
                      className="w-full bg-gray-50 border border-gray-100 focus:border-primary p-3 pl-10 rounded-xl outline-none transition-all font-medium text-xs h-12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[8px] font-lexend font-bold text-gray-400 uppercase tracking-widest pl-1">Pedido #</label>
                    <div className="relative">
                      <Package className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        value={formData.orderId}
                        onChange={e => setFormData({ ...formData, orderId: e.target.value })}
                        placeholder="123456"
                        className="w-full bg-gray-50 border border-gray-100 focus:border-primary p-3 pl-10 rounded-xl outline-none transition-all font-medium text-xs h-12"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-lexend font-bold text-gray-400 uppercase tracking-widest pl-1">Peso (kg)</label>
                    <div className="relative">
                      <Scale className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        value={formData.weight}
                        onChange={e => setFormData({ ...formData, weight: e.target.value })}
                        placeholder="2.5"
                        className="w-full bg-gray-50 border border-gray-100 focus:border-primary p-3 pl-10 rounded-xl outline-none transition-all font-medium text-xs h-12"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-lexend font-bold text-gray-400 uppercase tracking-widest pl-1">Prioridade</label>
                  <div className="flex gap-2">
                    {['baixa', 'normal', 'alta'].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setFormData({ ...formData, priority: p })}
                        className={`flex-1 py-2.5 rounded-lg font-bold text-[9px] uppercase border transition-all ${
                          formData.priority === p 
                            ? 'bg-primary border-primary text-primary-dark' 
                            : 'bg-gray-50 border-gray-100 text-gray-400'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-lexend font-bold text-gray-400 uppercase tracking-widest pl-1">Observações</label>
                  <textarea
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Ex: Deixar na portaria..."
                    rows={2}
                    className="w-full bg-gray-50 border border-gray-100 focus:border-primary p-3 rounded-xl outline-none transition-all font-medium resize-none text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-primary-dark font-display font-black py-4 rounded-xl shadow-xl shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 text-xs"
                >
                  <Plus className="w-5 h-5" />
                  ADICIONAR À ROTA
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
