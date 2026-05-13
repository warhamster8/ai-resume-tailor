'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  FileText, Plus, Trash2, ExternalLink, 
  Clock, LayoutDashboard, User, Building2, 
  Calendar, ArrowRight, Briefcase
} from 'lucide-react';

export default function Dashboard() {
  const [baseCV, setBaseCV] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push('/login');

    const { data: cvData } = await supabase
      .from('cv_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (cvData) {
      setBaseCV(cvData.find(cv => cv.is_base));
      setHistory(cvData.filter(cv => !cv.is_base));
    }
    setLoading(true); // Simuliamo un caricamento veloce per lo stato UI
    setTimeout(() => setLoading(false), 500);
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa ottimizzazione?')) return;
    await supabase.from('cv_history').delete().eq('id', id);
    fetchData();
  };

  const handlePreview = (cv: any) => {
    localStorage.setItem('preview_cv', JSON.stringify(cv.optimized_cv_data));
    router.push('/optimize');
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-muted/30">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      {/* Header Dashboard */}
      <div className="bg-white border-b border-border mb-8">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
                <LayoutDashboard className="w-10 h-10 text-accent" /> Dashboard
              </h1>
              <p className="text-secondary mt-2 text-lg">Bentornato, gestisci i tuoi CV e le tue candidature.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => router.push('/optimize')} className="btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" /> Nuova Ottimizzazione
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 space-y-12">
        
        {/* Sezione Master CV */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-accent" />
            <h2 className="text-2xl font-bold tracking-tight">Il Tuo Master CV</h2>
          </div>
          
          {baseCV ? (
            <div className="group relative bg-white border border-border rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-accent"></div>
              <div className="flex justify-between items-start">
                <div className="flex gap-6 items-center">
                  <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center">
                    <FileText className="w-8 h-8 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{baseCV.base_cv_data.personalInfo.fullName}</h3>
                    <p className="text-secondary">Ultimo aggiornamento: {new Date(baseCV.created_at).toLocaleDateString('it-IT')}</p>
                  </div>
                </div>
                <button onClick={() => router.push('/editor')} className="btn-secondary flex items-center gap-2 px-6 py-3 rounded-2xl">
                  Modifica Master <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border-2 border-dashed border-border rounded-3xl p-12 text-center hover:border-accent/50 transition-colors">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-20" />
              <h3 className="text-xl font-bold">Nessun CV Base configurato</h3>
              <p className="text-secondary mt-2 mb-6">Importa o crea il tuo CV principale per iniziare a ottimizzarlo.</p>
              <button onClick={() => router.push('/editor')} className="btn-primary">Configura Master CV</button>
            </div>
          )}
        </section>

        {/* Tabella Ottimizzazioni */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-accent" />
              <h2 className="text-2xl font-bold tracking-tight">Cronologia Ottimizzazioni</h2>
            </div>
            <span className="px-4 py-1 bg-accent/10 text-accent text-sm font-bold rounded-full">
              {history.length} Versioni generate
            </span>
          </div>

          <div className="bg-white border border-border rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider">Azienda</th>
                  <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider">Ruolo Target</th>
                  <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider">Data Creazione</th>
                  <th className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {history.map((cv) => (
                  <tr key={cv.id} className="group hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-bold text-foreground">{cv.target_company}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3 text-secondary">
                        <Briefcase className="w-4 h-4 opacity-50" />
                        <span>{cv.target_position}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-secondary">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 opacity-50" />
                        {new Date(cv.created_at).toLocaleDateString('it-IT')}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handlePreview(cv)}
                          className="p-2 text-secondary hover:text-accent hover:bg-accent/10 rounded-xl transition-all"
                          title="Vedi Dettagli"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(cv.id)}
                          className="p-2 text-secondary hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="Elimina"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-secondary italic">
                      Nessuna ottimizzazione ancora generata.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
