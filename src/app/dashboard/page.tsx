'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { FileText, Plus, Search, Building2, Calendar, Trash2, ExternalLink, Star, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [history, setHistory] = useState<any[]>([]);
  const [baseCV, setBaseCV] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('cv_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBaseCV(data.find(cv => cv.is_base));
      setHistory(data.filter(cv => !cv.is_base));
    }
    setLoading(false);
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('Sei sicuro di voler eliminare questo CV dalla cronologia?')) return;

    const { error } = await supabase
      .from('cv_history')
      .delete()
      .eq('id', id);

    if (!error) {
      setHistory(prev => prev.filter(cv => cv.id !== id));
    }
  };

  const filteredHistory = history.filter(cv => 
    cv.target_position.toLowerCase().includes(search.toLowerCase()) ||
    cv.target_company.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-accent" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-12">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-secondary mt-2">Bentornato! Qui trovi il tuo CV base e le ottimizzazioni effettuate.</p>
        </div>
        <Link href="/optimize" className="btn-primary flex items-center gap-2 px-6 py-3 shadow-lg shadow-accent/20">
          <Plus className="w-5 h-5" /> Nuova Ottimizzazione
        </Link>
      </div>

      {/* Sezione CV BASE - Separata e Prominente */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" /> Il Tuo CV Base
        </h2>
        {baseCV ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 crisp-card p-6 bg-gradient-to-br from-accent/10 to-background border-accent/30 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                <FileText className="w-20 h-20 text-accent" />
              </div>
              <div className="relative z-10 space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-accent bg-accent/10 px-2 py-1 rounded">MASTER CV</span>
                  <h3 className="text-2xl font-bold mt-2">Dati Principali</h3>
                  <p className="text-sm text-secondary">Aggiornato il {new Date(baseCV.updated_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-3 pt-2">
                  <Link href="/editor" className="btn-primary text-xs py-2 px-4 flex items-center gap-2">
                    Modifica Master <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Statistiche rapide accanto al Base CV */}
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <div className="crisp-card p-6 flex flex-col justify-center">
                <p className="text-sm font-medium text-secondary">CV Generati</p>
                <h3 className="text-4xl font-bold text-foreground">{history.length}</h3>
              </div>
              <div className="crisp-card p-6 flex flex-col justify-center">
                <p className="text-sm font-medium text-secondary">Aziende Target</p>
                <h3 className="text-4xl font-bold text-foreground">
                  {new Set(history.map(h => h.target_company)).size}
                </h3>
              </div>
            </div>
          </div>
        ) : (
          <div className="crisp-card p-10 text-center border-dashed border-2">
            <p className="text-secondary">Non hai ancora configurato un CV Base.</p>
            <Link href="/editor" className="text-accent font-bold mt-2 inline-block">Configura ora &rarr;</Link>
          </div>
        )}
      </div>

      {/* Sezione Cronologia */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
          <h2 className="text-xl font-bold">Cronologia Ottimizzazioni</h2>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-full bg-background text-sm focus:ring-2 focus:ring-accent outline-none" 
              placeholder="Cerca per ruolo o azienda..."
            />
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-border rounded-xl">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-20" />
            <p className="text-lg font-medium">Nessun CV trovato.</p>
            <p className="text-sm text-secondary mt-1">Le tue ottimizzazioni appariranno qui.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHistory.map((cv) => (
              <div key={cv.id} className="crisp-card group overflow-hidden flex flex-col">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                      <FileText className="w-6 h-6" />
                    </div>
                    <button 
                      onClick={(e) => handleDelete(e, cv.id)}
                      className="p-2 text-secondary hover:text-red-500 hover:bg-red-50 transition-all rounded-lg"
                      title="Elimina"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="text-lg font-bold group-hover:text-accent transition-colors leading-tight">
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
                
                {/* Footer della card con pulsante APRI funzionante */}
                <button 
                  onClick={() => {
                    // Salviamo temporaneamente i dati nel localStorage o passiamo l'ID
                    // In questo caso, per semplicità, simuliamo l'apertura passando l'ID o i dati
                    localStorage.setItem('preview_cv', JSON.stringify(cv.optimized_cv_data));
                    router.push('/optimize'); // Reindirizziamo dove c'è la preview
                  }}
                  className="bg-muted/50 px-6 py-4 border-t border-border flex justify-between items-center hover:bg-accent/5 transition-colors group/link"
                >
                  <span className="text-xs font-bold text-accent flex items-center gap-2">
                    Vedi Dettagli <ExternalLink className="w-3 h-3" />
                  </span>
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
