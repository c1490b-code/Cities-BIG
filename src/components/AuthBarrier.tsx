import React, { useState, useEffect } from 'react';
import { auth, signInWithGoogle, db } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, LogIn } from 'lucide-react';

interface AuthBarrierProps {
  children: React.ReactNode;
}

export const AuthBarrier: React.FC<AuthBarrierProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Ensure user profile exists
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || 'Anonymous Official',
            role: 'official', // Default to official for this app
            createdAt: serverTimestamp(),
          });
        }
      }
      setUser(currentUser);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-[var(--accent)]"
        >
          <div className="w-12 h-12 border-2 border-[var(--accent)] rounded-sm flex items-center justify-center">
             <div className="w-6 h-6 bg-[var(--accent)]" />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {!user ? (
        <motion.div
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#0A0A0B]"
        >
          <div className="max-w-md w-full space-y-12">
            <header className="space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-[var(--accent)] rounded-sm flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                  <ShieldCheck size={40} className="text-black" strokeWidth={1.5} />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-[0.2em] uppercase text-white">Registry Terminal</h1>
                <p className="text-[10px] text-[var(--accent)] font-mono tracking-[0.3em] uppercase">
                  Secure Union Link • Region NYC-METRO-01
                </p>
              </div>
            </header>

            <div className="terminal-border p-10 bg-[#0F0F12] rounded-sm space-y-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-50" />
              <p className="text-sm font-serif italic text-white/70 leading-relaxed max-w-xs mx-auto">
                "Industrial expansion was simply too quick for humans. The New Deal set it apart. Work America."
              </p>
              <button
                onClick={signInWithGoogle}
                className="formal-button w-full flex items-center justify-center gap-3 py-4"
              >
                <LogIn size={14} />
                Initialize Protocol
              </button>
            </div>

            <footer className="data-label animate-pulse">
              System Authorization Required • Regional Node 889-ALPHA
            </footer>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
