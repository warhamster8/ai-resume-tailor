'use client';

import Link from 'next/link';
import { Lock, FileText, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-accent/10 text-accent rounded-3xl flex items-center justify-center mb-8">
        <FileText className="w-10 h-10" />
      </div>
      
      <h1 className="text-5xl font-extrabold tracking-tight mb-4">
        AI Resume Tailor
      </h1>
      <p className="text-xl text-secondary max-w-lg mb-12">
        La tua workstation privata per l'ottimizzazione intelligente dei CV.
      </p>

      <div className="flex gap-4">
        {session ? (
          <Link href="/dashboard" className="btn-primary px-8 py-4 text-lg flex items-center gap-2 group">
            Entra nella Workstation <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        ) : (
          <Link href="/login" className="btn-primary px-8 py-4 text-lg flex items-center gap-2 group">
            Accedi <Lock className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>

      <div className="mt-20 pt-10 border-t border-border w-full max-w-xs">
        <p className="text-xs text-secondary uppercase tracking-widest font-bold">
          Accesso Riservato
        </p>
      </div>
    </div>
  );
}
