'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ResumeData, OptimizedResumeData } from '@/types/resume';
import { Loader2, Wand2, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import ResumePreview from '@/components/pdf/ResumePreview';

export default function OptimizePage() {
  const [baseCV, setBaseCV] = useState<ResumeData | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedData, setOptimizedData] = useState<OptimizedResumeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Controlla se arriviamo dalla dashboard per vedere un CV specifico
    const cachedCV = localStorage.getItem('preview_cv');
    if (cachedCV) {
      setOptimizedData(JSON.parse(cachedCV));
      localStorage.removeItem('preview_cv'); // Pulizia
    }

    async function fetchBaseCV() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('cv_history')
        .select('base_cv_data')
        .eq('user_id', user.id)
        .eq('is_base', true)
        .single();

      if (data) setBaseCV(data.base_cv_data);
    }
    fetchBaseCV();
  }, []);

  const handleOptimize = async () => {
    if (!baseCV || !jobTitle || !jobDescription) {
      setError('Inserisci il Job Title e la Job Description per continuare.');
      return;
    }

    setIsOptimizing(true);
    setError(null);

    try {
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          baseData: baseCV, 
          jobTitle, 
          jobDescription 
        }),
      });

      if (!response.ok) throw new Error('Errore durante l\'ottimizzazione');

      const data = await response.json();
      setOptimizedData(data);
      
      // Salvataggio automatico nella cronologia
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('cv_history').insert({
        user_id: user?.id,
        base_cv_data: baseCV,
        optimized_cv_data: data,
        target_company: 'Da LinkedIn',
        target_position: jobTitle,
        is_base: false
      });

    } catch (err) {
      setError('Si è verificato un errore con l\'IA. Riprova tra poco.');
    } finally {
      setIsOptimizing(false);
    }
  };

  if (!baseCV) return (
    <div className="max-w-4xl mx-auto py-20 text-center">
      <AlertCircle className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
      <h2 className="text-2xl font-bold">Nessun CV Base trovato</h2>
      <p className="text-secondary mt-2">Prima di ottimizzare, devi creare il tuo CV base nell'editor.</p>
      <a href="/editor" className="btn-primary inline-block mt-6">Vai all'Editor</a>
    </div>
  );

  if (optimizedData) {
    return <ResumePreview data={optimizedData} />;
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ottimizza il tuo CV</h1>
        <p className="text-secondary mt-2">Incolla i dettagli dell'offerta di lavoro per "indorare la pillola" in modo strategico.</p>
      </div>

      <div className="crisp-card p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-accent" /> Job Title dell'annuncio
          </label>
          <input
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="w-full p-3 border border-border rounded-xl bg-background outline-none focus:ring-2 focus:ring-accent"
            placeholder="E.g. Senior Project Manager, Sviluppatore React..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold">Job Description (Copia da LinkedIn)</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={10}
            className="w-full p-4 border border-border rounded-xl bg-background outline-none focus:ring-2 focus:ring-accent resize-none text-sm leading-relaxed"
            placeholder="Incolla qui l'intera descrizione della posizione..."
          />
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <button
          onClick={handleOptimize}
          disabled={isOptimizing}
          className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2 group"
        >
          {isOptimizing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Genera Versione Ottimizzata <CheckCircle2 className="w-5 h-5" />
            </>
          )}
        </button>
      </div>

      <div className="p-6 bg-muted/30 rounded-2xl border border-border">
        <h3 className="font-bold flex items-center gap-2 mb-2">
          <FileText className="w-5 h-5 text-accent" /> CV Base in uso
        </h3>
        <p className="text-xs text-secondary">
          Verrà utilizzato il tuo CV Base salvato ({baseCV.personalInfo.fullName}). 
          L'IA non inventerà nuove esperienze, ma enfatizzerà quelle esistenti per matchare il ruolo di <strong>{jobTitle || '...'}</strong>.
        </p>
      </div>
    </div>
  );
}
