/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import TopBar from './components/TopBar';
import BottomNav from './components/BottomNav';
import MapBackground from './components/MapBackground';
import DeliveryList from './components/DeliveryList';
import { Wallet, Users, LayoutDashboard, History, Settings, TrendingUp } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('mapa');

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden relative">
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
              <DeliveryList />
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
                  <p className="text-2xl font-display font-black text-on-surface mt-1">R$ 145,20</p>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-surface-highest shadow-sm">
                  <span className="text-[10px] font-lexend font-bold text-gray-400 uppercase tracking-widest">Entregas</span>
                  <p className="text-2xl font-display font-black text-on-surface mt-1">12</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-4 mb-8 overflow-x-auto pb-4 no-scrollbar">
                {[
                  { icon: History, label: 'Histórico' },
                  { icon: Wallet, label: 'Resgate' },
                  { icon: LayoutDashboard, label: 'Relatórios' },
                  { icon: Settings, label: 'Meta Diária' }
                ].map((action, i) => (
                  <button key={i} className="flex flex-col items-center gap-2 min-w-[80px]">
                    <div className="w-14 h-14 bg-surface-low rounded-2xl flex items-center justify-center border border-surface-highest hover:bg-surface-high transition-colors">
                      <action.icon className="w-6 h-6 text-on-surface-variant" />
                    </div>
                    <span className="text-[10px] font-lexend font-bold text-gray-400 uppercase">{action.label}</span>
                  </button>
                ))}
              </div>

              {/* Progress Bar placeholder */}
              <div className="bg-white p-6 rounded-[32px] border border-surface-highest shadow-sm mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-on-surface">Meta Diária</h3>
                  <span className="text-xs font-bold text-primary-dark">R$ 145 / R$ 200</span>
                </div>
                <div className="w-full h-3 bg-surface-low rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '72.5%' }}
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
              className="absolute inset-0 pt-20 px-6 flex flex-col items-center justify-center"
            >
              <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                <Users className="w-10 h-10 text-secondary" />
              </div>
              <h2 className="text-xl font-display font-bold text-on-surface">Central da Galera</h2>
              <p className="text-center text-sm text-gray-500 mt-2 px-8 font-medium">
                Conecte-se com outros pilotos, receba alertas de radar e compartilhe a visão.
              </p>
              <button className="mt-8 bg-secondary text-white px-8 py-3 rounded-2xl font-bold active:scale-95 transition-all shadow-lg shadow-secondary/20">
                Entrar no Chat
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
                <div className="w-20 h-20 rounded-3xl overflow-hidden border-2 border-primary shadow-lg shadow-primary/10">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Matheus" alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-black text-on-surface">Matheus Silva</h2>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-xs font-lexend font-bold text-gray-400">Plano Elite • 4.98 ★</span>
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

              <button className="w-full mt-8 p-5 rounded-2xl bg-red-50 text-red-500 font-bold border border-red-100 active:scale-[0.98] transition-all">
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
