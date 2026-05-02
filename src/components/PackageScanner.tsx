import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Scan, 
  Boxes, 
  Zap, 
  Plus, 
  Trash2, 
  MapPin, 
  CheckCircle2, 
  Loader2,
  ChevronRight,
  Camera
} from 'lucide-react';
import { useFirebase } from '../lib/FirebaseProvider';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Html5Qrcode } from 'html5-qrcode';

interface PackageScannerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ScannedPackage {
  id: string;
  address: string;
  customerName: string;
}

export default function PackageScanner({ isOpen, onClose }: PackageScannerProps) {
  const { user } = useFirebase();
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [packages, setPackages] = useState<ScannedPackage[]>([]);
  const [manualInput, setManualInput] = useState('');
  const [optimizing, setOptimizing] = useState(false);

  useEffect(() => {
    if (isScanning && !scannerRef.current) {
      const html5QrCode = new Html5Qrcode("package-reader");
      scannerRef.current = html5QrCode;
      
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      
      html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          // Mock address parsing or just use the text
          const newPackage: ScannedPackage = {
            id: Math.random().toString(36).substr(2, 9),
            address: decodedText,
            customerName: `Scanner #${packages.length + 1}`
          };
          setPackages(prev => [newPackage, ...prev]);
          stopScanning();
        },
        (errorMessage) => {
          // Silent catch for scanning attempts
        }
      ).catch(err => {
        console.error("Erro ao iniciar camera:", err);
        let msg = "Erro ao iniciar camera.";
        if (err.name === 'NotFoundError' || err.message?.includes('NotFound')) {
          msg = "Nenhuma câmera encontrada.";
        } else if (err.name === 'NotAllowedError') {
          msg = "Permissão negada.";
        }
        setScanError(msg);
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
    setScanError(null);
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    
    const newPackage: ScannedPackage = {
      id: Date.now().toString(),
      address: manualInput,
      customerName: `Manual #${packages.length + 1}`
    };
    setPackages(prev => [newPackage, ...prev]);
    setManualInput('');
  };

  const removePackage = (id: string) => {
    setPackages(prev => prev.filter(p => p.id !== id));
  };

  const startRoute = async () => {
    if (!user || packages.length === 0) return;
    
    setOptimizing(true);
    // Simulate route optimization logic (TSP)
    await new Promise(r => setTimeout(r, 2000));

    try {
      // Add all packages to Firestore
      for (const pkg of packages) {
        await addDoc(collection(db, 'deliveries'), {
          userId: user.uid,
          address: pkg.address,
          customerName: pkg.customerName,
          status: 'PENDENTE',
          type: 'PACOTE',
          createdAt: serverTimestamp(),
          price: 5.50 // Standard batch price
        });
      }
      onClose();
    } catch (error) {
      console.error("Error creating package route:", error);
    } finally {
      setOptimizing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex flex-col"
    >
      <div className="flex-1 flex flex-col p-6 max-w-lg mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Boxes className="w-6 h-6 text-primary-dark" />
            </div>
            <div>
              <h2 className="text-xl font-display font-black text-white italic leading-tight">ROTA DE PACOTES</h2>
              <p className="text-[10px] font-lexend font-bold text-white/50 uppercase tracking-widest">Multi-Entrega Inteligente</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white active:scale-90 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner Area */}
        <div className="relative aspect-video bg-black rounded-3xl overflow-hidden border-2 border-white/10 mb-6 group">
          {isScanning ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-primary z-20 bg-black">
              {!scanError ? (
                <>
                  <div id="package-reader" className="w-full h-full" />
                  <motion.div 
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 left-0 right-0 h-0.5 bg-primary/50 shadow-[0_0_15px_rgba(255,204,0,0.8)] z-10"
                  />
                  <button 
                    onClick={stopScanning}
                    className="absolute bottom-4 right-4 bg-white/10 text-white px-4 py-2 rounded-xl text-[10px] font-black"
                  >
                    CANCELAR
                  </button>
                </>
              ) : (
                <div className="p-6 flex flex-col items-center text-center">
                  <Camera className="w-8 h-8 text-red-500 mb-2" />
                  <p className="text-[10px] font-lexend font-black text-white/50 mb-4">{scanError}</p>
                  <button 
                    onClick={() => setIsScanning(false)}
                    className="text-[10px] font-black text-primary underline"
                  >
                    TENTAR MANUALMENTE
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <button 
                onClick={() => setIsScanning(true)}
                className="flex flex-col items-center gap-2 text-white/40 group-hover:text-primary transition-colors"
              >
                <Scan className="w-12 h-12" />
                <span className="text-[10px] font-black uppercase tracking-widest">Toque para Escanear</span>
              </button>
            </div>
          )}
        </div>

        {/* Manual Input */}
        <form onSubmit={handleManualAdd} className="mb-6">
          <div className="flex gap-2">
            <input 
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Digitar endereço manualmente..."
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-lexend text-sm focus:outline-none focus:border-primary transition-all"
            />
            <button 
              type="submit"
              className="bg-primary text-primary-dark w-14 rounded-2xl flex items-center justify-center active:scale-90 transition-all shadow-lg"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </form>

        {/* Scanned List */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-lexend font-black text-white/30 uppercase tracking-widest">Pacotes na Fila ({packages.length})</span>
            {packages.length > 0 && (
              <button onClick={() => setPackages([])} className="text-[9px] font-bold text-red-400 uppercase tracking-widest">Limpar Tudo</button>
            )}
          </div>
          
          <div className="flex flex-col gap-3 pb-8">
            <AnimatePresence initial={false}>
              {packages.map((pkg) => (
                <motion.div 
                  key={pkg.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white truncate max-w-[200px]">{pkg.address}</p>
                      <p className="text-[9px] text-white/40 uppercase font-lexend font-bold">{pkg.customerName}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => removePackage(pkg.id)}
                    className="p-2 text-white/20 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {packages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-white/20 text-center">
                <Boxes className="w-12 h-12 mb-3 opacity-10" />
                <p className="text-sm font-lexend font-medium">Nenhum pacote escaneado</p>
                <p className="text-[10px]">Use a câmera ou digite o endereço acima</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 mt-auto">
          <button 
            disabled={packages.length === 0 || optimizing}
            onClick={startRoute}
            className={`w-full py-5 rounded-3xl font-display font-black italic text-sm tracking-widest active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3 ${
              packages.length === 0 || optimizing
              ? 'bg-white/10 text-white/20' 
              : 'bg-primary text-primary-dark'
            }`}
          >
            {optimizing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                OTIMIZANDO ROTA...
              </>
            ) : (
              <>
                OTIMIZAR E INICIAR ROTA ({packages.length})
                <Zap className="w-5 h-5 fill-current" />
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
