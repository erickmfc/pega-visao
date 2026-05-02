/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import TopBar from './components/TopBar';
import BottomNav from './components/BottomNav';
import MapBackground from './components/MapBackground';
import DeliveryList from './components/DeliveryList';
import SplashScreen from './components/SplashScreen';
import AddDeliveryModal from './components/AddDeliveryModal';
import { useFirebase } from './lib/FirebaseProvider';
import { signInWithGoogle, auth } from './lib/firebase';
import { Wallet, Users, LayoutDashboard, History, Settings, TrendingUp, LogIn, Plus, Fuel as FuelIcon, MapPin, AlertCircle, AlertTriangle } from 'lucide-react';

export default function App() {
  const { user, profile, loading } = useFirebase();
  const [activeTab, setActiveTab] = useState('mapa');
  const [showSplash, setShowSplash] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  if (loading) return null;

  if (!user) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-surface relative overflow-hidden">
        <AnimatePresence>
          {showSplash && (
            <SplashScreen onComplete={() => setShowSplash(false)} />
          )}
        </AnimatePresence>
        
        <div className="absolute top-1/4 flex flex-col items-center">
           <div className="w-24 h-24 bg-primary p-4 rounded-3xl shadow-xl shadow-primary/20 mb-6">
              <img src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=200" alt="Logo" className="w-full h-full object-contain" />
           </div>
           <h1 className="text-3xl font-display font-black italic text-on-surface">PEGA VISÃO</h1>
           <p className="text-gray-400 font-lexend text-sm mt-2 font-bold tracking-widest">O APP DO PILOTO</p>
        </div>

        <button 
          onClick={() => signInWithGoogle()}
          className="bg-white text-on-surface border border-surface-highest px-8 py-4 rounded-2xl flex items-center gap-3 font-bold shadow-sm active:scale-95 transition-all mt-32"
        >
          <LogIn className="w-5 h-5 text-primary-dark" />
          Entrar com Google
        </button>
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

      <TopBar />

      <main className="flex-1 w-full relative">
        <AnimatePresence mode="wait">
          {activeTab === 'mapa' && (
            <motion.div
              key="map-page"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <MapBackground />
              <div className="absolute top-44 right-4 z-40">
                <button 
                  onClick={() => setIsAdding(true)}
                  className="bg-primary-dark text-white p-4 rounded-3xl shadow-xl shadow-black/20 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Plus className="w-6 h-6" />
                  <span className="font-display font-bold text-sm">NOVO</span>
                </button>
              </div>
              <DeliveryList />
              <AddDeliveryModal isOpen={isAdding} onClose={() => setIsAdding(false)} />
            </motion.div>
          )}

          {activeTab === 'ganhos' && (
            <motion.div
              key="ganhos-page"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute inset-0 pt-20 px-6 overflow-y-auto pb-32"
            >
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-3xl font-display font-black italic text-primary-dark">GANHOS</h2>
                  <p className="text-sm font-lexend text-gray-500 font-medium">Confira seu progresso hoje</p>
                </div>
                <div className="bg-primary/20 p-3 rounded-2xl">
                  <TrendingUp className="w-6 h-6 text-primary-dark" />
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-5 rounded-3xl border border-surface-highest shadow-sm">
                  <span className="text-[10px] font-lexend font-bold text-gray-400 uppercase tracking-widest">Total Hoje</span>
                  <p className="text-2xl font-display font-black text-on-surface mt-1">R$ {profile?.currentEarnings.toFixed(2)}</p>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-surface-highest shadow-sm">
                  <span className="text-[10px] font-lexend font-bold text-gray-400 uppercase tracking-widest">Lucro Líquido</span>
                  <p className="text-2xl font-display font-black text-emerald-500 mt-1">R$ {(profile?.currentEarnings || 0 * 0.85).toFixed(2)}</p>
                </div>
              </div>

              {/* Resource usage */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[
                  { label: 'KM RODADOS', val: '42 km', icon: MapPin },
                  { label: 'GASOLINA', val: 'R$ 24,50', icon: FuelIcon },
                  { label: 'EFICIÊNCIA', val: '14 km/L', icon: TrendingUp }
                ].map((stat, i) => (
                  <div key={i} className="bg-surface-low p-3 rounded-2xl flex flex-col items-center border border-white">
                    <stat.icon className="w-4 h-4 text-primary-dark mb-1 opacity-50" />
                    <span className="text-[8px] font-lexend font-black text-gray-400 uppercase">{stat.label}</span>
                    <span className="text-xs font-display font-bold text-on-surface">{stat.val}</span>
                  </div>
                ))}
              </div>

              {/* Fuel Radar Section */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-display font-black text-lg text-on-surface">RADAR DE COMBUSTÍVEL</h3>
                  <button className="text-[10px] font-lexend font-bold text-primary-dark underline">POSTO MAIS BARATO</button>
                </div>
                
                <div className="space-y-3">
                  {[
                    { name: 'Posto Shell - Av. Rebouças', price: '5,49', distance: '800m', votes: 12 },
                    { name: 'Ipiranga - Rua Augusta', price: '5,55', distance: '1.2km', votes: 8 }
                  ].map((gas, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-surface-highest flex justify-between items-center">
                      <div className="flex gap-3 items-center">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                          <FuelIcon className="w-5 h-5 text-primary-dark" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-on-surface">{gas.name}</p>
                          <p className="text-[10px] font-medium text-gray-400">{gas.distance} • {gas.votes} confirmações</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-display font-black text-primary-dark">R$ {gas.price}</p>
                        <button className="text-[9px] font-lexend font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">CONFIRMAR</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                {[
                  { icon: History, label: 'Histórico', color: 'text-blue-500', bg: 'bg-blue-50' },
                  { icon: Wallet, label: 'Resgate', color: 'text-emerald-500', bg: 'bg-emerald-50' },
                  { icon: LayoutDashboard, label: 'Relatórios', color: 'text-indigo-500', bg: 'bg-indigo-50' },
                  { icon: Settings, label: 'Meta Diária', color: 'text-orange-500', bg: 'bg-orange-50' }
                ].map((action, i) => (
                  <button key={i} className="flex flex-col items-center gap-2 group">
                    <div className={`w-full aspect-square ${action.bg} rounded-2xl flex items-center justify-center border border-white/50 shadow-sm group-active:scale-95 transition-all`}>
                      <action.icon className={`w-6 h-6 ${action.color}`} />
                    </div>
                    <span className="text-[9px] font-lexend font-bold text-gray-400 uppercase text-center leading-tight">{action.label}</span>
                  </button>
                ))}
              </div>

              {/* Progress Bar placeholder */}
              <div className="bg-white p-6 rounded-[32px] border border-surface-highest shadow-sm mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-on-surface">Meta Diária</h3>
                  <span className="text-xs font-bold text-primary-dark">R$ {profile?.currentEarnings.toFixed(0)} / R$ {profile?.dailyGoal}</span>
                </div>
                <div className="w-full h-3 bg-surface-low rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((profile?.currentEarnings || 0) / (profile?.dailyGoal || 1) * 100, 100)}%` }}
                    className="h-full bg-primary"
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'comunidade' && (
             <motion.div
              key="com-page"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 pt-20 px-6 flex flex-col h-full pb-32 overflow-hidden"
            >
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-3xl font-display font-black italic text-secondary">COMUNIDADE</h2>
                  <p className="text-sm font-lexend text-gray-500 font-medium">Alertas em tempo real da galera</p>
                </div>
              </div>

              {/* Quick Alerts */}
              <div className="flex gap-3 mb-6 overflow-x-auto no-scrollbar pb-2">
                {[
                  { label: 'Blitz', icon: AlertCircle, color: 'bg-red-50 text-red-500' },
                  { label: 'Chuva', icon: TrendingUp, color: 'bg-blue-50 text-blue-500' },
                  { label: 'Posto', icon: FuelIcon, color: 'bg-emerald-50 text-emerald-500' },
                  { label: 'Trânsito', icon: AlertTriangle, color: 'bg-amber-50 text-amber-500' }
                ].map((alert, i) => (
                  <button key={i} className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-lexend font-bold text-xs whitespace-nowrap border border-white ${alert.color}`}>
                    <alert.icon className="w-4 h-4" />
                    {alert.label}
                  </button>
                ))}
              </div>

              {/* Feed */}
              <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
                {[
                  { user: 'Beto 011', time: '2 min', msg: 'Blitz na Av. do Estado sentido Sul! Tá parado tudo.', type: 'blitz' },
                  { user: 'Careca Trans', time: '5 min', msg: 'Ipiranga da Rebouças baixou pra 5,45! Dale.', type: 'posto' },
                  { user: 'Nany Entregas', time: '12 min', msg: 'Chovendo forte na Lapa, cuidado pista lisa.', type: 'chuva' },
                  { user: 'Zé do Grau', time: '15 min', msg: 'Rua Augusta tá com evento, evitem a descida.', type: 'transito' }
                ].map((post, i) => (
                  <div key={i} className="bg-white p-4 rounded-2xl border border-surface-highest flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-high flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-on-surface">{post.user}</span>
                        <span className="text-[10px] font-medium text-gray-400">{post.time}</span>
                      </div>
                      <p className="text-sm text-gray-600 leading-snug">{post.msg}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button className="mt-4 bg-secondary text-white py-4 rounded-2xl font-display font-black shadow-lg shadow-secondary/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                REPORTAR AGORA
              </button>
            </motion.div>
          )}

          {activeTab === 'perfil' && (
            <motion.div
              key="profile-page"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute inset-0 pt-20 px-6"
            >
              <div className="flex items-center gap-4 mb-10">
                <div className="w-20 h-20 rounded-3xl overflow-hidden bg-primary p-2 shadow-lg shadow-primary/10">
                  <img src={profile?.avatar || "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=200"} alt="Avatar" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-black text-on-surface">{profile?.name || user.displayName}</h2>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`w-2 h-2 rounded-full ${profile?.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className="text-xs font-lexend font-bold text-gray-400">{profile?.isOnline ? 'ONLINE' : 'OFFLINE'} • {profile?.rating.toFixed(2)} ★</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {['Dados Pessoais', 'Minha Moto', 'Segurança', 'Documentação', 'Ajuda e Suporte'].map((item) => (
                  <button key={item} className="w-full bg-white p-5 rounded-2xl border border-surface-highest flex justify-between items-center group active:bg-surface-low transition-colors">
                    <span className="font-sans font-bold text-gray-700">{item}</span>
                    <LayoutDashboard className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
                  </button>
                ))}
              </div>

              <button 
                onClick={() => auth.signOut()}
                className="w-full mt-8 p-5 rounded-2xl bg-red-50 text-red-500 font-bold border border-red-100 active:scale-[0.98] transition-all"
              >
                Sair da Conta
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
