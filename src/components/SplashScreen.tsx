import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000); 
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-between py-16 px-8 bg-gradient-to-b from-[#ffff00] via-[#ffff00]/90 to-[#e0e0e0]"
    >
      <div className="flex flex-col items-center gap-4 text-center mt-8">
        <motion.h1 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-display font-black text-on-surface leading-tight"
        >
          Pega Visão: Sua<br />Rota, Seu Lucro
        </motion.h1>
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', delay: 0.4 }}
        className="relative w-72 h-72 flex items-center justify-center"
      >
        {/* Placeholder for the helmet image provided in the prompt */}
        <img 
          src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=600" 
          alt="Capacete Pega Visão" 
          className="w-full h-full object-contain drop-shadow-2xl"
        />
      </motion.div>

      <div className="flex flex-col items-center gap-8 w-full">
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-2xl font-display font-bold text-on-surface text-center px-4"
        >
          O organizador inteligente para quem não para
        </motion.p>

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          onClick={onComplete}
          className="bg-[#ffff00] text-on-surface font-display font-bold text-lg py-4 px-8 rounded-full shadow-xl flex items-center gap-3 active:scale-95 transition-all border-b-4 border-black/10"
        >
          Começar Agora <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
}
