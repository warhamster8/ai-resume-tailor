'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ResumeData, OptimizedResumeData } from '@/types/resume';
import ResumePreview from '@/components/pdf/ResumePreview';
import { useRouter } from 'next/navigation';

export default function OptimizePage() {
  const router = useRouter();
  const [baseCV, setBaseCV] = useState<ResumeData | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [language, setLanguage] = useState<'it' | 'en'>('it');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedData, setOptimizedData] = useState<OptimizedResumeData | null>(null);
  const [error, setError] = useState('');
  const [refinementLoading, setRefinementLoading] = useState(false);

  useEffect(() => {
    async function loadBaseCV() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('cv_history')
        .select('base_cv_data')
        .eq('user_id', user.id)
        .eq('is_base', true)
        .single();

      if (data) {
        setBaseCV(data.base_cv_data);
      } else if (fetchError) {
        console.error('Error loading base CV:', fetchError);
      }
    }
    loadBaseCV();
  }, [router]);

  const handleOptimize = async () => {
    if (!baseCV || !jobTitle || !jobDescription) {
      alert('Compila tutti i campi prima di ottimizzare');
      return;
    }

    setIsOptimizing(true);
    setError('');
    
    try {
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          baseData: baseCV, 
          jobTitle, 
          jobDescription,
          targetLanguage: language === 'it' ? 'ITALIANO' : 'INGLESE'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Errore durante l\'ottimizzazione');
      }

      const data = await response.json();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('cv_history').insert([
          {
            user_id: user.id,
            base_cv_data: baseCV,
            optimized_cv_data: data,
            target_company: companyName,
            target_position: jobTitle,
            is_base: false
          }
        ]);
      }

      setOptimizedData(data);

    } catch (err: any) {
      setError(err.message || 'Errore IA. Riprova tra poco.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleRefine = async (command: string) => {
    if (!optimizedData) return;
    setRefinementLoading(true);
    try {
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          baseData: optimizedData, 
          jobTitle, 
          jobDescription,
          targetLanguage: language === 'it' ? 'ITALIANO' : 'INGLESE',
          refinement: command
        }),
      });

      const data = await response.json();
      setOptimizedData(data);
    } catch (err) {
      console.error('Refinement error:', err);
    } finally {
      setRefinementLoading(false);
    }
  };

  if (!baseCV) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Manca il CV Base</h1>
        <p className="text-gray-600 mb-6">Devi caricare il tuo CV principale nella Dashboard prima di ottimizzarlo.</p>
        <button onClick={() => router.push('/dashboard')} className="bg-blue-600 text-white px-6 py-2 rounded-lg">Vai alla Dashboard</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Sinistra: Form Input */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Target Positioning</h1>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Azienda</label>
                  <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="es. Google, Ferrari" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Ruolo Target</label>
                  <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="es. Senior Project Manager" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Lingua di Output</label>
                <div className="flex gap-4">
                  <button onClick={() => setLanguage('it')} className={`flex-1 py-3 rounded-xl border transition-all ${language === 'it' ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' : 'bg-white border-slate-200 text-slate-600'}`}>Italiano 🇮🇹</button>
                  <button onClick={() => setLanguage('en')} className={`flex-1 py-3 rounded-xl border transition-all ${language === 'en' ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' : 'bg-white border-slate-200 text-slate-600'}`}>English 🇬🇧</button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Job Description (copia e incolla)</label>
                <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} rows={8} className="w-full px-4 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm" placeholder="Incolla qui il testo dell'annuncio di lavoro per permettere all'IA di analizzarlo..." />
              </div>

              <button onClick={handleOptimize} disabled={isOptimizing} className={`w-full py-4 rounded-xl font-bold text-white transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 ${isOptimizing ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg shadow-blue-200'}`}>
                {isOptimizing ? (
                  <><span className="animate-spin text-xl">⏳</span> Analisi e Ottimizzazione in corso...</>
                ) : (
                  <>🚀 Ottimizza CV per questa posizione</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Destra: Preview o Raffinamento */}
        <div className="relative">
          {optimizedData ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-slate-800">Preview Ottimizzata</h2>
                <div className="flex gap-2">
                  <button onClick={() => setOptimizedData(null)} className="text-sm text-slate-500 hover:text-red-500">Cancella</button>
                </div>
              </div>
              
              <ResumePreview data={optimizedData} />

              {/* BARRA COMANDI DI RAFFINAMENTO */}
              <div className="bg-white p-6 rounded-2xl shadow-md border border-blue-100 mt-6">
                <h3 className="text-sm font-bold text-blue-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                  ✨ Comandi di Raffinamento IA
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleRefine("Voglio altre 3 varianti diverse per i Job Title, mantieni lo standard di mercato ma non clonare l'annuncio.")}
                    disabled={refinementLoading}
                    className="py-2 px-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium hover:bg-blue-50 hover:border-blue-300 transition-all flex items-center gap-2"
                  >
                    🔄 Varia Job Titles
                  </button>
                  <button 
                    onClick={() => handleRefine("Riscrivi il Sommario (Professional Summary) rendendolo più incisivo e orientato ai risultati.")}
                    disabled={refinementLoading}
                    className="py-2 px-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium hover:bg-blue-50 hover:border-blue-300 transition-all flex items-center gap-2"
                  >
                    ✍️ Riscrivi Profilo
                  </button>
                  <button 
                    onClick={() => handleRefine("Punta molto di più sulle mie competenze AI, Vibe-coding e digital transformation nelle descrizioni delle esperienze.")}
                    disabled={refinementLoading}
                    className="py-2 px-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium hover:bg-blue-50 hover:border-blue-300 transition-all flex items-center gap-2"
                  >
                    🤖 Più Focus AI
                  </button>
                  <button 
                    onClick={() => {
                      const req = prompt("Cosa vuoi cambiare in questo CV?");
                      if(req) handleRefine(req);
                    }}
                    disabled={refinementLoading}
                    className="py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all flex items-center gap-2"
                  >
                    💬 Altra Modifica...
                  </button>
                </div>
                {refinementLoading && (
                  <div className="mt-4 text-center text-sm text-blue-600 animate-pulse font-medium">
                    L'IA sta rielaborando il CV secondo le tue istruzioni...
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl border-2 border-dashed border-slate-200 opacity-60">
              <div className="text-6xl mb-6">📄</div>
              <h2 className="text-2xl font-bold text-slate-400">Pronto per l'Analisi</h2>
              <p className="text-slate-400 mt-2 max-w-xs">Configura il target a sinistra per vedere la magia dell'ottimizzazione.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
