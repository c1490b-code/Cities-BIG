import React, { useState } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'motion/react';
import { FileCheck, PenTool, CheckCircle2, Loader2, Landmark } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface RegistryFormProps {
  onComplete: () => void;
}

export const RegistryForm: React.FC<RegistryFormProps> = ({ onComplete }) => {
  const [cityName, setCityName] = useState('');
  const [region, setRegion] = useState('');
  const [step, setStep] = useState<'details' | 'signing' | 'verifying' | 'completed'>('details');
  const [signedDocs, setSignedDocs] = useState<Record<string, boolean>>({
    terms: false,
    license: false,
    contract: false,
    lease: false,
    utility: false,
  });
  const [loading, setLoading] = useState(false);
  const [registryId, setRegistryId] = useState('');

  const documents = [
    { id: 'terms', label: 'City Terms of Realization' },
    { id: 'license', label: 'Industrial Expansion License' },
    { id: 'contract', label: 'Regional Civil Contract' },
    { id: 'lease', label: 'Land & Resource Lease' },
    { id: 'utility', label: 'Universal Utility Pact' },
  ];

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityName || !region) return;
    setStep('signing');
  };

  const handleSign = (id: string) => {
    setSignedDocs(prev => ({ ...prev, [id]: true }));
  };

  const allSigned = Object.values(signedDocs).every(Boolean);

  const startVerification = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    setStep('verifying');

    const id = `REG-${Date.now()}`;
    setRegistryId(id);

    try {
      // 1. Initial Submission
      const registryData = {
        cityName,
        region,
        representativeUid: auth.currentUser.uid,
        representativeName: auth.currentUser.displayName || 'Official',
        representativeEmail: auth.currentUser.email || '',
        termsSigned: signedDocs.terms,
        licenseSigned: signedDocs.license,
        contractSigned: signedDocs.contract,
        leaseSigned: signedDocs.lease,
        utilitySigned: signedDocs.utility,
        timestamp: serverTimestamp(),
        status: 'pending'
      };

      await setDoc(doc(db, 'registries', id), registryData);

      // 2. Presidential Signature (AI powered)
      const prompt = `You are the Regional President of a futuristic Civil Registry. 
      A city named "${cityName}" in the "${region}" region has completed its industrial expansion and is signing off.
      Generate a brief, formal, authoritative verification signature. 
      Include a "Presidential Approval Code" (hex string).
      Format: "Signed by Regional President [Name]. Code: [Code]. Verified at [timestamp]."`;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });

      const signature = result.text || `Verified by Regional AI Command. Code: AUTH-${Math.random().toString(16).slice(2, 10).toUpperCase()}`;
      const seal = `SEAL-${region.toUpperCase()}-${id.slice(-4)}`;

      // 3. Finalize Update
      await updateDoc(doc(db, 'registries', id), {
        status: 'verified',
        presidentialSignature: signature,
        presidentialSeal: seal,
      });

      setStep('completed');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `registries/${id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111114] py-12 px-6 flex flex-col items-center">
      <motion.div
        layout
        className="max-w-2xl w-full bg-[#18181C] border border-white/10 shadow-2xl flex flex-col"
      >
        <header className="p-12 pb-0">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="font-serif text-4xl text-white/90 mb-2">Civil Completion & License</h1>
              <p className="text-white/40 text-sm tracking-wide">Final Expansion Phase: The Big City Tip</p>
            </div>
            <Landmark className="text-emerald-500/30" size={40} strokeWidth={1} />
          </div>
          <div className="w-full h-px bg-white/10 mt-8 mb-10"></div>
        </header>

        <div className="px-12 pb-12 flex-1">
          {step === 'details' && (
            <form onSubmit={handleInitialSubmit} className="space-y-8">
              <p className="font-serif text-white/60 leading-relaxed italic">
                Initialize the regional mapping for civil realization. Specify the target municipality and its governing regional district.
              </p>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="data-label text-emerald-400/60 uppercase">Municipality Designation</label>
                  <input
                    type="text"
                    required
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-sm p-4 font-serif text-xl text-white outline-none focus:border-emerald-500/50 transition-colors"
                    placeholder="e.g. Neo York Terminal"
                  />
                </div>
                <div className="space-y-2">
                  <label className="data-label text-emerald-400/60 uppercase">Regional Sector</label>
                  <input
                    type="text"
                    required
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-sm p-4 font-serif text-xl text-white outline-none focus:border-emerald-500/50 transition-colors"
                    placeholder="e.g. Northern Axis"
                  />
                </div>
              </div>
              <button type="submit" className="formal-button w-full py-4 text-sm">
                Proceed to Instrument Execution
              </button>
            </form>
          )}

          {step === 'signing' && (
            <div className="space-y-8">
              <div className="font-serif text-white/70 leading-loose text-base">
                <p className="mb-6">
                  I, the undersigned Representative of the Civilization, hereby certify the full realization of the outlying neighborhoods. As dictated by the original tenets of the New Deal, we move beyond the explosion of the big cities to a state of sustained utility.
                </p>
              </div>

              <div className="space-y-3">
                <span className="data-label">Instrument Checklist</span>
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-sm">
                    <span className="font-serif text-sm text-white/80">{doc.label}</span>
                    {!signedDocs[doc.id] ? (
                      <button
                        onClick={() => handleSign(doc.id)}
                        className="text-[9px] uppercase tracking-widest border border-emerald-500/50 text-emerald-400 px-4 py-1 hover:bg-emerald-500/10 transition-colors"
                      >
                        Execute
                      </button>
                    ) : (
                      <CheckCircle2 size={16} className="text-emerald-500" />
                    )}
                  </div>
                ))}
              </div>

              <button
                disabled={!allSigned}
                onClick={startVerification}
                className="formal-button w-full flex items-center justify-center gap-3 py-4 mt-4"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <PenTool size={16} />}
                Clock Signature
              </button>
            </div>
          )}

          {step === 'verifying' && (
            <div className="text-center py-20 space-y-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="inline-block"
              >
                <div className="w-16 h-16 border border-emerald-500/30 rounded-full flex items-center justify-center">
                  <Landmark size={32} strokeWidth={1} className="text-emerald-500" />
                </div>
              </motion.div>
              <div className="space-y-3">
                <h2 className="text-2xl font-serif text-white/90 italic">Awaiting Regional President</h2>
                <div className="flex justify-center gap-1">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                      transition={{ delay: i * 0.2, duration: 1, repeat: Infinity }}
                      className="w-1 h-1 bg-emerald-500 rounded-full"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 'completed' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="font-serif text-white/70 leading-loose text-base">
                <p>
                  The industrial expansion phase is hereby declared completed. The final tip remains the threshold of our new union. Realization cycle complete.
                </p>
              </div>

              <div className="p-8 bg-black/40 border-t border-b border-white/5 space-y-6">
                <div className="flex justify-between items-end gap-12">
                  <div className="flex-1">
                    <div className="h-14 border-b border-white/20 mb-3 flex items-end overflow-hidden pb-1">
                       <motion.span 
                         initial={{ x: -20, opacity: 0 }}
                         animate={{ x: 0, opacity: 0.8 }}
                         className="font-serif italic text-2xl text-emerald-400 select-none"
                       >
                         {registryId} // Pulse Signature
                       </motion.span>
                    </div>
                    <div className="text-[10px] uppercase text-white/30 tracking-[0.2em]">President of the Region / Computer Verified</div>
                  </div>
                  <div className="w-20 h-20 border border-emerald-500/20 bg-emerald-500/5 rotate-45 flex items-center justify-center">
                    <span className="data-label -rotate-45 text-emerald-500/40 font-bold border-2 border-emerald-500/20 p-1">OFFICIAL</span>
                  </div>
                </div>
              </div>

              <button onClick={onComplete} className="formal-button w-full py-4">
                Close Terminal
              </button>
            </div>
          )}
        </div>
      </motion.div>
      
      <footer className="mt-8 data-label flex gap-8">
        <span>Security Layer: Active</span>
        <span>Paperless Realization v4.0</span>
      </footer>
    </div>
  );
};
