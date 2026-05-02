import { Menu, Sensors } from 'lucide-react';

export default function TopBar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass h-16 px-6 flex items-center justify-between border-b border-surface-highest">
      <button className="p-2 hover:bg-surface-low rounded-full transition-colors active:scale-95">
        <Menu className="w-6 h-6" />
      </button>
      
      <h1 className="font-display font-black italic tracking-tight text-xl text-primary-dark">
        MODO RUA
      </h1>
      
      <button className="p-2 hover:bg-surface-low rounded-full transition-colors active:scale-95">
        <div className="relative">
          <Sensors className="w-6 h-6 text-primary-dark" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white animate-pulse" />
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
