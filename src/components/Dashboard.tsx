import React, { useEffect, useState } from 'react';
import { db, auth, logout } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, History, LogOut, Landmark, ScrollText, BadgeCheck } from 'lucide-react';
import { RegistryEntry } from '../types';

interface DashboardProps {
  onNewRegistry: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNewRegistry }) => {
  const [registries, setRegistries] = useState<RegistryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'registries'),
      where('representativeUid', '==', auth.currentUser.uid),
      orderBy('timestamp', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RegistryEntry[];
      setRegistries(docs);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0B] text-[#E0E0E0] font-sans">
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-[#0F0F12]">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-emerald-500 rounded-sm flex items-center justify-center">
            <Landmark size={18} className="text-black" />
          </div>
          <span className="text-sm font-bold tracking-[0.2em] uppercase">Realization Terminal v4.0</span>
        </div>
        <div className="flex items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-white/40">
          <span className="hidden md:inline">Region: NYC-METRO-01</span>
          <span className="text-emerald-400">● Network: Secure Union Link</span>
          <button onClick={logout} className="hover:text-white transition-colors">
            <LogOut size={14} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 border-r border-white/10 p-6 hidden lg:flex flex-col gap-8 bg-[#0D0D0F]">
          <section>
            <h3 className="text-[11px] text-white/30 uppercase tracking-widest mb-4">Expansion Metrics</h3>
            <div className="space-y-4">
              <div className="sidebar-stat">
                <div className="text-[10px] text-white/40 uppercase mb-1">Industrial Realization</div>
                <div className="text-2xl font-light text-emerald-100 italic">99.8%</div>
                <div className="w-full h-1 bg-white/10 mt-2">
                  <div className="w-[99.8%] h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                </div>
              </div>
              <div className="sidebar-stat">
                <div className="text-[10px] text-white/40 uppercase mb-1">Tip Occupancy Status</div>
                <div className="text-2xl font-light text-amber-100 italic">Ready</div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-[11px] text-white/30 uppercase tracking-widest mb-4">Protocol Notes</h3>
            <p className="text-[12px] leading-relaxed text-white/60 italic font-serif">
              "Industrial expansion was simply too quick for humans. The New Deal set it apart... Work America."
            </p>
          </section>

          <div className="mt-auto pb-4">
            <div className="flex items-center gap-2 text-[10px] text-emerald-400/50 uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              Awaiting Regional Sign-off
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-10 bg-[#111114]">
          <div className="max-w-5xl mx-auto space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
              <div className="space-y-2">
                <h2 className="text-5xl font-serif text-white/90">Civil Archives</h2>
                <p className="text-sm tracking-wide text-white/40 uppercase">Systematic Record of Realized Neighborhoods</p>
              </div>
              <button
                onClick={onNewRegistry}
                className="formal-button"
              >
                + New Entry
              </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {registries.length === 0 && !loading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full py-20 text-center space-y-4 border border-dashed border-white/10 rounded"
                  >
                    <ScrollText className="mx-auto opacity-10" size={60} strokeWidth={1} />
                    <p className="font-serif italic opacity-40 text-lg">Archives empty. Awaiting first sign-off.</p>
                  </motion.div>
                ) : (
                  registries.map((entry, idx) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-[#18181C] border border-white/10 p-6 flex flex-col group hover:border-emerald-500/30 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex flex-col">
                          <span className="data-label text-emerald-400/60 uppercase">Protocol {entry.id.split('-')[1]}</span>
                          <h3 className="text-2xl mt-1 text-white/80">{entry.cityName}</h3>
                        </div>
                        {entry.status === 'verified' && (
                          <BadgeCheck className="text-emerald-500" size={24} strokeWidth={1.5} />
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                          <span className="data-label">Regional Hub</span>
                          <p className="text-xs text-white/60 mt-1">{entry.region}</p>
                        </div>
                        <div>
                          <span className="data-label">Authorization</span>
                          <p className="text-[10px] uppercase font-bold text-emerald-400 mt-1">Verified Union</p>
                        </div>
                      </div>

                      <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                         <span className="data-label">Date: {entry.timestamp instanceof Date ? entry.timestamp.toLocaleDateString() : 'REAL-TIME'}</span>
                         <span className="text-[10px] text-white/20 italic font-serif">Signed by {entry.representativeName}</span>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>

      <footer className="h-8 border-t border-white/10 bg-[#0D0D0F] flex items-center px-8 justify-between text-[9px] uppercase tracking-[0.3em] text-white/30">
        <div>Union Country Standard: 889-ALPHA</div>
        <div className="hidden md:block">Realization Cycle: Complete</div>
        <div>Security Terminal-V4.0</div>
      </footer>
    </div>
  );
};
