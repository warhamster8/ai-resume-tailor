'use client';

import { useEffect, useState } from 'react';
import { User, Mail, Shield, LogOut, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    }
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const userInitial = user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Il Tuo Profilo</h1>
      
      <div className="space-y-6">
        <div className="crisp-card p-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center text-white text-4xl font-bold">
              {userInitial}
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">{user?.user_metadata?.full_name || 'Utente Autenticato'}</h2>
              <p className="text-secondary flex items-center gap-2">
                <Mail className="w-4 h-4" /> {user?.email}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="crisp-card p-6 space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Shield className="w-5 h-5 text-accent" /> Account & Sicurezza
            </h3>
            <p className="text-sm text-secondary">
              Gestisci le tue credenziali e le impostazioni di sicurezza del tuo account Supabase.
            </p>
            <button className="text-sm font-medium text-accent hover:underline">
              Cambia Password
            </button>
          </div>

          <div className="crisp-card p-6 space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2 text-red-500">
              <LogOut className="w-5 h-5" /> Sessione
            </h3>
            <p className="text-sm text-secondary">
              Vuoi disconnetterti dall'applicazione su questo dispositivo?
            </p>
            <button 
              onClick={handleLogout}
              className="btn-primary bg-red-500 hover:bg-red-600 text-white border-none"
            >
              Disconnetti
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
