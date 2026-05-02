import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SplashScreen from './components/SplashScreen';
import TopBar from './components/TopBar';
import BottomNav from './components/BottomNav';
import MapBackground from './components/MapBackground';
import DeliveryList from './components/DeliveryList';
import QuickActions from './components/QuickActions';
import PerformanceStats from './components/PerformanceStats';
import RouteSummary from './components/RouteSummary';
import AddDeliveryModal from './components/AddDeliveryModal';
import PackageScanner from './components/PackageScanner';
import { useFirebase } from './lib/FirebaseProvider';
import { signInWithGoogle, auth } from './lib/firebase';
import { LayoutDashboard, Wallet, Users, Settings, LogIn, Plus, TrendingUp, Fuel as FuelIcon, MapPin, History, AlertCircle, AlertTriangle, X, Check } from 'lucide-react';

export default function App() {
  const { user, profile, loading } = useFirebase();
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState('mapa');
  const [isAdding, setIsAdding] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [navigatingDelivery, setNavigatingDelivery] = useState<{ id: string, address: string } | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (loading) return null;
  
  if (!user) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white p-8 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-24 h-24 bg-primary rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary/30 active:rotate-6 transition-transform">
            <span className="font-display font-black text-4xl text-primary-dark italic">PV</span>
          </div>
          <h1 className="text-4xl font-display font-black italic text-on-surface mb-2 tracking-tight">PEGA VISÃO</h1>
          <p className="text-gray-500 font-lexend text-sm mb-12 font-medium">O app definitivo para quem corre nas ruas.</p>
          
          <button 
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-4 bg-white border-2 border-gray-100 p-5 rounded-3xl font-lexend font-extrabold text-sm text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition-all shadow-xl shadow-gray-100/50 mb-8"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            Entrar com Google
          </button>

          <div className="bg-gray-50 rounded-3xl p-6 text-left border border-gray-100 flex flex-col gap-5 mb-8 shadow-inner">
            <h4 className="font-display font-black text-xs uppercase tracking-widest text-primary-dark opacity-60">Segurança do Rastro</h4>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border border-emerald-200">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-gray-600 leading-relaxed font-bold">Verificação em 5s</p>
                <p className="text-[10px] text-gray-400">Sua posição é reconfirmada automaticamente para garantir precisão total na sua rota.</p>
              </div>
            </div>
          </div>
          
          <p className="text-[10px] text-gray-400 font-medium px-8 italic">
            Ao entrar, você concorda com nossos Termos de Serviço e Política de Privacidade.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden relative">
      <AnimatePresence>
        {showSplash && (
          <SplashScreen onComplete={() => setShowSplash(false)} />
        )}
      </AnimatePresence>

      <TopBar onMenuClick={() => setIsMenuOpen(true)} />

      {/* Simple Sidebar Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-4/5 max-w-[300px] bg-white z-[61] shadow-2xl p-6 flex flex-col"
            >
              <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-100">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center font-display font-black text-primary-dark shadow-lg shadow-primary/20">
                  PV
                </div>
                <div>
                  <h3 className="font-display font-black italic text-lg leading-none">PEGA VISÃO</h3>
                  <p className="text-[10px] font-lexend font-bold text-gray-400 mt-1 uppercase tracking-widest">Menu Principal</p>
                </div>
              </div>

              <div className="flex-1 space-y-2">
                {[
                  { icon: LayoutDashboard, label: 'Dashboard', id: 'mapa' },
                  { icon: Wallet, label: 'Financeiro', id: 'ganhos' },
                  { icon: Users, label: 'Comunidade', id: 'comunidade' },
                  { icon: Settings, label: 'Configurações', id: 'perfil' },
                ].map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-primary/10 text-primary-dark font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-sans text-sm">{item.label}</span>
                  </button>
                ))}
              </div>

              <button 
                onClick={() => auth.signOut()}
                className="mt-10 p-5 rounded-2xl bg-red-50 text-red-500 font-bold border border-red-100 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                Sair do App
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 w-full relative">
        <AnimatePresence mode="wait">
          {activeTab === 'mapa' ? (
            <motion.div 
              key="mapa"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col"
            >
              <MapBackground 
                navigatingTo={navigatingDelivery} 
                onCancelNavigation={() => setNavigatingDelivery(null)}
              />
              {!navigatingDelivery && (
                <div className="mt-auto pointer-events-none relative z-10 p-4 pb-24 flex flex-col gap-4">
                  <QuickActions 
                    onAddDelivery={() => setIsAdding(true)} 
                    onShowStats={() => setShowSummary(true)}
                    onScanBatch={() => setIsScanning(true)}
                  />
                  <DeliveryList 
                    onNavigate={setNavigatingDelivery} 
                    onFinishRoute={() => setShowSummary(true)}
                  />
                </div>
              )}
              {navigatingDelivery && (
                <div className="absolute bottom-6 left-0 right-0 z-50 pointer-events-none px-6 flex flex-col gap-3">
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white/95 backdrop-blur-3xl rounded-[2rem] p-5 shadow-2xl border border-white/50 pointer-events-auto flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-2xl flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-primary-dark" />
                      </div>
                      <div className="max-w-[150px]">
                        <p className="text-[8px] font-lexend font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Destino</p>
                        <p className="text-xs font-bold text-on-surface truncate">{navigatingDelivery.address}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setNavigatingDelivery(null)}
                      className="bg-gray-100 text-gray-500 p-3 rounded-2xl active:scale-95 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>

                  <button 
                    onClick={() => {
                      // Simulating finishing this specific delivery for the UX
                      // in a real app this would update the specific doc status
                      setNavigatingDelivery(null);
                    }}
                    className="w-full bg-emerald-500 text-white font-display font-black italic px-8 py-5 rounded-[2rem] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2 pointer-events-auto"
                  >
                    CONCLUIR ENTREGA <Check className="w-5 h-5" />
                  </button>
                </div>
              )}
            </motion.div>
          ) : activeTab === 'ganhos' ? (
            <motion.div 
              key="ganhos"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute inset-0 flex flex-col p-6 pt-24 bg-surface pb-32 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-display font-black italic text-on-surface tracking-tighter">FINANCEIRO</h2>
                  <p className="text-xs font-lexend font-bold text-gray-400 uppercase tracking-widest mt-1">Sua correria em números</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-primary-dark" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 mb-8">
                <div className="bg-primary p-8 rounded-[2.5rem] shadow-2xl shadow-primary/30 relative overflow-hidden group">
                  <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
                  <p className="text-[10px] font-lexend font-black text-primary-dark/40 uppercase tracking-widest mb-2">Saldo Disponível</p>
                  <h3 className="text-5xl font-display font-black text-primary-dark italic tracking-tighter mix-blend-multiply">
                    R$ {profile?.currentEarnings?.toFixed(2) || '0,00'}
                  </h3>
                  <button className="mt-6 flex items-center gap-2 bg-primary-dark text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg">
                    SOLICITAR SAQUE <TrendingUp className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-[8px] font-lexend font-black text-gray-400 uppercase tracking-widest mb-1 font-bold">Total de Entregas</p>
                    <p className="text-2xl font-display font-black italic text-on-surface">{profile?.totalDeliveries || 0}</p>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-[8px] font-lexend font-black text-gray-400 uppercase tracking-widest mb-1 font-bold">Ganhos do Mês</p>
                    <p className="text-2xl font-display font-black italic text-on-surface">R$ 1.840</p>
                  </div>
                </div>
              </div>

              <PerformanceStats />
            </motion.div>
          ) : activeTab === 'comunidade' ? (
             <motion.div 
               key="comunidade"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: 20 }}
               className="absolute inset-0 flex flex-col p-6 pt-24 bg-surface pb-32 overflow-y-auto"
             >
               <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="text-3xl font-display font-black italic text-on-surface tracking-tighter">COLA AQUI</h2>
                  <p className="text-xs font-lexend font-bold text-gray-400 uppercase tracking-widest mt-1">Radar de entrega em tempo real</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>

              <div className="space-y-6">
                <div className="bg-white p-6 rounded-[2.5rem] border-2 border-primary/20 shadow-xl">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                      <FuelIcon className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface">Combustível + Barato</h4>
                      <p className="text-[10px] text-gray-400 font-medium">Posto Ipiranga - Rua Augusta 1200</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-emerald-600 italic">R$ 4,89</span>
                    <span className="text-[8px] font-lexend font-bold bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full uppercase">Reportado há 5 min</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-lg">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface">Blitz do Detran</h4>
                      <p className="text-[10px] text-gray-400 font-medium">Av. Paulista sentido Consolação</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                       {[1,2,3].map(i => (
                         <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-200" />
                       ))}
                       <div className="text-[8px] font-bold text-gray-400 ml-4 flex items-center">+12 confirmaram</div>
                    </div>
                    <button className="text-[8px] font-black text-primary-dark underline uppercase">Duvidoso?</button>
                  </div>
                </div>

                <div className="bg-primary/5 p-8 rounded-[3rem] border-2 border-dashed border-primary/20 flex flex-col items-center text-center">
                  <Plus className="w-10 h-10 text-primary mb-4" />
                  <p className="font-bold text-on-surface text-sm">Viu algo na rua?</p>
                  <p className="text-[10px] text-gray-400 mt-1 max-w-[200px]">Ajude a comunidade e ganhe pontos extras na rede.</p>
                  <button className="mt-6 bg-primary text-primary-dark px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all">
                    REPORTAR AGORA
                  </button>
                </div>
              </div>
             </motion.div>
          ) : activeTab === 'perfil' ? (
            <motion.div 
               key="perfil"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: 20 }}
               className="absolute inset-0 flex flex-col p-6 pt-24 bg-surface pb-32 overflow-y-auto"
             >
               <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-display font-black italic text-on-surface tracking-tighter">PERFIL</h2>
                <Settings className="w-8 h-8 text-gray-300" />
              </div>

              <div className="flex flex-col items-center mb-10">
                <div className="relative">
                  <div className="w-24 h-24 rounded-[2.5rem] bg-gray-200 overflow-hidden border-4 border-primary shadow-2xl">
                    <img src={profile?.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-50">
                    <History className="w-5 h-5 text-primary-dark" />
                  </div>
                </div>
                <h3 className="text-2xl font-display font-black italic text-on-surface mt-6">{profile?.name || 'Seu Nome'}</h3>
                <p className="text-xs font-lexend font-bold text-gray-400 uppercase tracking-widest mt-1">Especialista Level 4</p>
              </div>

              <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-gray-100 flex flex-col gap-2">
                 {[
                   { label: 'Editar Veículo', icon: TrendingUp },
                   { label: 'Histórico de Entregas', icon: History },
                   { label: 'Documentação do MEI', icon: AlertCircle },
                   { label: 'Ajustes do Mapa', icon: MapPin },
                 ].map((item, i) => (
                   <button key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors">
                     <div className="flex items-center gap-4">
                       <item.icon className="w-5 h-5 text-gray-400" />
                       <span className="font-bold text-on-surface text-sm">{item.label}</span>
                     </div>
                     <span className="text-gray-300">→</span>
                   </button>
                 ))}
                 
                 <div className="h-[1px] bg-gray-50 my-4" />
                 
                 <button 
                  onClick={() => auth.signOut()}
                  className="flex items-center gap-4 p-4 rounded-2xl text-red-500 hover:bg-red-50 transition-colors"
                 >
                   <LogIn className="w-5 h-5" />
                   <span className="font-bold text-sm">Sair da Conta</span>
                 </button>
              </div>
             </motion.div>
          ) : null}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {isAdding && (
          <AddDeliveryModal 
            isOpen={isAdding} 
            onClose={() => setIsAdding(false)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSummary && (
          <RouteSummary 
            onDone={() => setShowSummary(false)} 
          />
        )}
      </AnimatePresence>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
