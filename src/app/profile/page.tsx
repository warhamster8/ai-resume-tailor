'use client';

import { User, Mail, Shield, LogOut } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Il Tuo Profilo</h1>
      
      <div className="space-y-6">
        <div className="crisp-card p-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center text-white text-4xl font-bold">
              U
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">Utente Demo</h2>
              <p className="text-secondary flex items-center gap-2">
                <Mail className="w-4 h-4" /> utente@example.com
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
            <button className="btn-primary bg-red-500 hover:bg-red-600 text-white border-none">
              Disconnetti
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
