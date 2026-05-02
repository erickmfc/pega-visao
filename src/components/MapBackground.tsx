import { Navigation } from 'lucide-react';

export default function MapBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-surface-high">
      {/* Semi-transparent overlay to make it look like a stylized map */}
      <div 
        className="w-full h-full bg-cover bg-center grayscale contrast-75 brightness-110 opacity-60"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=2066')`,
        }}
      />
      
      {/* Decorative route lines and points could be SVG here */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
        <path 
          d="M 100 200 L 250 450 L 500 300 L 700 600" 
          stroke="#ffd700" 
          strokeWidth="6" 
          fill="none" 
          strokeLinecap="round"
          className="animate-pulse"
        />
        <circle cx="100" cy="200" r="8" fill="#7b41b3" />
        <circle cx="700" cy="600" r="8" fill="#ffd700" />
      </svg>

      {/* HUD Info over map */}
      <div className="absolute top-20 left-4 right-4 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-2">
          <div className="glass px-4 py-2.5 rounded-xl shadow-soft pointer-events-auto flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-lexend font-semibold tracking-wider text-on-surface">
              ONLINE • 4 ENTREGAS
            </span>
          </div>
          
          <div className="glass px-4 py-2 rounded-xl shadow-soft pointer-events-auto flex items-center gap-2 translate-x-1">
            <span className="text-[10px] font-lexend font-bold text-primary-dark">HOJE</span>
            <span className="text-sm font-display font-black text-on-surface">R$ 145,20</span>
          </div>
        </div>
        
        <button className="bg-primary hover:bg-primary-dark text-on-surface-variant p-3 rounded-full shadow-lg shadow-primary/20 pointer-events-auto active:scale-95 transition-all">
          <Navigation className="w-6 h-6 rotate-45" />
        </button>
      </div>
    </div>
  );
}
