'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ResumeData, OptimizedResumeData } from '@/types/resume';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';

const ResumePreview = dynamic(() => import('@/components/pdf/ResumePreview'), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center text-slate-400">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  ),
});

const PDFDownloadButton = dynamic(() => import('@/components/pdf/PDFDownloadButton'), {
  ssr: false,
  loading: () => (
    <div className="bg-slate-100 text-slate-400 px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2">
      Caricamento...
    </div>
  ),
});

export default function OptimizePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
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
    async function loadInitialData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const id = searchParams.get('id');
        
        if (id) {
          const { data, error: fetchError } = await supabase
            .from('cv_history')
            .select('*')
            .eq('id', id)
            .single();

          if (fetchError) {
            setError("Impossibile caricare l'ottimizzazione.");
          }

          if (data) {
            setOptimizedData(data.optimized_cv_data);
            setCompanyName(data.target_company);
            setJobTitle(data.target_position);
            setJobDescription(data.optimized_cv_data._jobDescription || '');
            setBaseCV(data.base_cv_data);
            setCurrentRecordId(data.id);
            return;
          }
        }

        const { data: baseData } = await supabase
          .from('cv_history')
          .select('base_cv_data')
          .eq('user_id', user.id)
          .eq('is_base', true)
          .single();

        if (baseData) {
          setBaseCV(baseData.base_cv_data);
        }
      } finally {
        setInitialLoading(false);
      }
    }
    loadInitialData();
  }, [router, searchParams]);

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
        throw new Error(errorData.message || "Errore durante l'ottimizzazione");
      }

      const data = await response.json();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: insertedData } = await supabase.from('cv_history').insert([
          {
            user_id: user.id,
            base_cv_data: baseCV,
            optimized_cv_data: { ...data, _jobDescription: jobDescription },
            target_company: companyName,
            target_position: jobTitle,
            is_base: false
          }
        ]).select();

        if (insertedData && insertedData[0]) {
          setCurrentRecordId(insertedData[0].id);
        }
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

      if (currentRecordId) {
        await supabase
          .from('cv_history')
          .update({ optimized_cv_data: { ...data, _jobDescription: jobDescription } })
          .eq('id', currentRecordId);
      }
    } catch (err) {
      console.error('Refinement error:', err);
    } finally {
      setRefinementLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-slate-50">
      {/* Header compatto */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard')} className="text-slate-500 hover:text-slate-900 transition-colors">← Dashboard</button>
          <h1 className="text-xl font-bold text-slate-900">Ottimizzazione Resume</h1>
        </div>
        <div className="flex gap-3">
          {optimizedData && (
             <PDFDownloadButton data={optimizedData} fileName={`${companyName || 'Resume'}_${jobTitle || 'Optimized'}.pdf`} />
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-65px)]">
        
        {/* Colonna Sinistra: Controlli */}
        <div className="w-full lg:w-[450px] bg-white border-r border-slate-200 overflow-y-auto p-8 space-y-8">
          <section>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Target Job</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Azienda</label>
                <input 
                  type="text" 
                  value={companyName} 
                  onChange={(e) => setCompanyName(e.target.value)} 
                  placeholder="es. Google" 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-900 bg-white" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ruolo Target</label>
                <input 
                  type="text" 
                  value={jobTitle} 
                  onChange={(e) => setJobTitle(e.target.value)} 
                  placeholder="es. Project Manager" 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-900 bg-white" 
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Configurazione</h2>
            <div className="flex gap-2">
              <button onClick={() => setLanguage('it')} className={`flex-1 py-2 rounded-lg text-sm transition-all ${language === 'it' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-100 text-slate-600'}`}>Italiano 🇮🇹</button>
              <button onClick={() => setLanguage('en')} className={`flex-1 py-2 rounded-lg text-sm transition-all ${language === 'en' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-100 text-slate-600'}`}>English 🇬🇧</button>
            </div>
          </section>

          <section>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Job Description</h2>
            <textarea 
              value={jobDescription} 
              onChange={(e) => setJobDescription(e.target.value)} 
              rows={6} 
              className="w-full px-4 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-xs text-slate-900 bg-white" 
              placeholder="Incolla l'annuncio..." 
            />
          </section>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <button onClick={handleOptimize} disabled={isOptimizing} className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all ${isOptimizing ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {isOptimizing ? 'Ottimizzazione...' : '🚀 Genera Ottimizzazione'}
          </button>

          {optimizedData && (
            <div className="pt-8 border-t border-slate-100">
              <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">✨ Raffinamento IA</h3>
              <div className="grid grid-cols-1 gap-2">
                <button onClick={() => handleRefine('Voglio altre 3 varianti per i Job Title.')} disabled={refinementLoading} className="text-left py-2.5 px-4 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition-all disabled:opacity-50">🔄 Varia Job Titles</button>
                <button onClick={() => handleRefine('Riscrivi il profilo rendendolo più incisivo.')} disabled={refinementLoading} className="text-left py-2.5 px-4 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition-all disabled:opacity-50">✍️ Riscrivi Profilo</button>
                <button onClick={() => handleRefine('Focus su Vibe-coding e AI.')} disabled={refinementLoading} className="text-left py-2.5 px-4 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition-all disabled:opacity-50">🤖 Più Focus AI</button>
                <button onClick={() => { const r = prompt('Cosa vuoi cambiare?'); if (r) handleRefine(r); }} disabled={refinementLoading} className="text-left py-2.5 px-4 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-black transition-all disabled:opacity-50">💬 Altro comando...</button>
              </div>
            </div>
          )}
        </div>

        {/* Colonna Destra: Preview */}
        <div className="flex-1 bg-slate-200 overflow-y-auto p-4 md:p-12 flex justify-center items-start">
          {optimizedData ? (
            <div className="w-full max-w-5xl shadow-2xl rounded-lg overflow-hidden">
               <ResumePreview data={optimizedData} />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <span className="text-6xl mb-4 opacity-20">📄</span>
              <p className="font-medium">L&apos;anteprima del CV apparirà qui</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
