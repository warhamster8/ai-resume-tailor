'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { FileText, Plus, Search, Building2, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      const { data, error } = await supabase
        .from('cv_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error) setHistory(data || []);
      setLoading(false);
    }
    fetchHistory();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-secondary mt-2">Gestisci i tuoi CV e le tue candidature.</p>
        </div>
        <Link href="/editor" className="btn-primary flex items-center gap-2 px-6 py-3">
          <Plus className="w-5 h-5" /> Crea Nuovo CV
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="crisp-card p-6 bg-accent/5 border-accent/20">
          <p className="text-sm font-medium text-secondary">Totale Ottimizzazioni</p>
          <h3 className="text-3xl font-bold mt-1">{history.length}</h3>
        </div>
        <div className="crisp-card p-6">
          <p className="text-sm font-medium text-secondary">Aziende Contattate</p>
          <h3 className="text-3xl font-bold mt-1">
            {new Set(history.map(h => h.target_company)).size}
          </h3>
        </div>
        <div className="crisp-card p-6">
          <p className="text-sm font-medium text-secondary">Ultima Attività</p>
          <h3 className="text-lg font-bold mt-1">
            {history.length > 0 
              ? new Date(history[0].created_at).toLocaleDateString() 
              : 'Nessuna'}
          </h3>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4 border-b border-border pb-4">
          <h2 className="text-xl font-bold">Cronologia CV</h2>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
            <input 
              className="w-full pl-10 pr-4 py-2 border border-border rounded-full bg-background text-sm focus:ring-2 focus:ring-accent outline-none" 
              placeholder="Cerca azienda o posizione..."
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-secondary">Caricamento...</div>
        ) : history.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-border rounded-xl">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-20" />
            <p className="text-lg font-medium">Ancora nessun CV ottimizzato.</p>
            <p className="text-sm text-secondary mt-1">Inizia caricando il tuo CV base nell'editor.</p>
            <Link href="/editor" className="mt-6 inline-block text-accent font-medium hover:underline">
              Vai all'editor &rarr;
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((cv) => (
              <div key={cv.id} className="crisp-card group cursor-pointer overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                      <FileText className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-secondary bg-muted px-2 py-1 rounded">
                      Template {cv.template_id}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold group-hover:text-accent transition-colors">
                    {cv.target_position}
                  </h3>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-secondary">
                      <Building2 className="w-4 h-4" />
                      {cv.target_company}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-secondary">
                      <Calendar className="w-4 h-4" />
                      {new Date(cv.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="bg-muted/50 px-6 py-3 border-t border-border flex justify-between items-center">
                  <span className="text-xs font-medium text-accent">Vedi Dettagli</span>
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
