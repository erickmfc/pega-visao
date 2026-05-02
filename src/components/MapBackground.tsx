import { Navigation } from 'lucide-react';
import { useFirebase } from '../lib/FirebaseProvider';

export default function MapBackground() {
  const { profile, coords } = useFirebase();

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-surface-high">
      {/* Semi-transparent overlay to make it look like a stylized map */}
      <div 
        className="w-full h-full bg-cover bg-center grayscale contrast-[0.8] brightness-110 opacity-70"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=2000')`,
        }}
      />
      
      {/* HUD Info over map */}
      <div className="absolute top-20 left-4 right-4 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-2">
          <div className="glass px-4 py-2.5 rounded-xl shadow-soft pointer-events-auto flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${profile?.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-[10px] font-lexend font-semibold tracking-wider text-on-surface">
              {profile?.isOnline ? 'GPS ATIVO' : 'OFFLINE'}
            </span>
          </div>
          
          <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-soft pointer-events-auto flex flex-col border border-white">
            <span className="text-[8px] font-lexend font-bold text-gray-400 uppercase tracking-widest">Sua Localização</span>
            <span className="text-xs font-display font-black text-on-surface truncate max-w-[150px]">
              {coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : 'Buscando sinal...'}
            </span>
          </div>
        </div>
        
        <button className="bg-primary hover:bg-primary-dark text-on-surface-variant p-4 rounded-3xl shadow-xl shadow-primary/20 pointer-events-auto active:scale-95 transition-all">
          <Navigation className="w-8 h-8 rotate-45" />
        </button>
      </div>

      {/* Pulsing Dot for user location */}
      {coords && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative">
            <div className="w-12 h-12 bg-primary/20 rounded-full animate-ping absolute -inset-3" />
            <div className="w-6 h-6 bg-primary rounded-full border-4 border-white shadow-2xl relative z-10">
              <Navigation className="w-3 h-3 text-on-surface-variant absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
