import { Menu } from 'lucide-react';
import { useFirebase } from '../lib/FirebaseProvider';

export default function TopBar() {
  const { profile, toggleOnline, coords } = useFirebase();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md h-16 px-6 flex items-center justify-between border-b border-surface-highest">
      <button className="p-2 hover:bg-surface-low rounded-full transition-colors active:scale-95 text-on-surface">
        <Menu className="w-6 h-6" />
      </button>
      
      <div className="flex flex-col items-center">
        <h1 className="font-display font-black italic tracking-tighter text-xl text-primary-dark -mb-1">
          PEGA VISÃO
        </h1>
        {profile?.isOnline && (
          <div className="flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${coords ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
            <span className="text-[8px] font-lexend font-black text-gray-400">
              {coords ? 'SINAL GPS OK' : 'BUSCANDO GPS'}
            </span>
          </div>
        )}
      </div>
      
      <button 
        onClick={toggleOnline}
        className={`p-2 rounded-full transition-all active:scale-90 ${profile?.isOnline ? 'bg-primary/10' : 'bg-surface-low'}`}
      >
        <div className="relative">
          <Sensors className={`w-6 h-6 ${profile?.isOnline ? 'text-primary-dark' : 'text-gray-400'}`} />
          {profile?.isOnline && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
          )}
        </div>
      </button>
    </header>
  );
}

function Sensors(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12a10 10 0 0 1 10-10" />
      <path d="M22 12a10 10 0 0 0-10-10" />
      <path d="M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
      <path d="M12 18a6 6 0 0 1-6-6" />
      <path d="M12 18a6 6 0 0 0 6-6" />
    </svg>
  );
}
