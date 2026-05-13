import Link from 'next/link';
import { ArrowRight, Zap, Shield, Layout } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative isolate">
      {/* Background decoration */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-accent to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 text-center">
        <div className="flex justify-center mb-10">
          <span className="rounded-full px-3 py-1 text-xs font-semibold leading-6 text-accent ring-1 ring-inset ring-accent/20 bg-accent/5">
            Powered by DeepSeek AI
          </span>
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl mb-8 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-secondary">
          Il tuo CV, ottimizzato in <span className="text-accent">secondi</span>.
        </h1>
        <p className="mx-auto max-w-2xl text-lg leading-8 text-secondary mb-12">
          Adatta il tuo CV a ogni Job Description. Supera i sistemi ATS e colpisci i recruiter con versioni personalizzate e professionali create dall'intelligenza artificiale.
        </p>
        <div className="flex items-center justify-center gap-x-6">
          <Link href="/editor" className="btn-primary px-8 py-4 text-lg flex items-center gap-2 group">
            Inizia Ora <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/dashboard" className="text-sm font-semibold leading-6 hover:text-accent transition-colors">
            Vedi la Dashboard <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Feature grid */}
        <div className="mt-32 grid grid-cols-1 gap-12 sm:grid-cols-3">
          <div className="flex flex-col items-center p-6 rounded-2xl border border-border bg-background/50 backdrop-blur-sm">
            <div className="p-3 rounded-xl bg-accent/10 text-accent mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg">Ottimizzazione AI</h3>
            <p className="text-sm text-secondary mt-2">Usa DeepSeek-V3 per adattare ogni parola alla posizione specifica.</p>
          </div>
          <div className="flex flex-col items-center p-6 rounded-2xl border border-border bg-background/50 backdrop-blur-sm">
            <div className="p-3 rounded-xl bg-accent/10 text-accent mb-4">
              <Layout className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg">6 Template Premium</h3>
            <p className="text-sm text-secondary mt-2">Scegli tra stili Minimal, Creative, Tech e altri design professionali.</p>
          </div>
          <div className="flex flex-col items-center p-6 rounded-2xl border border-border bg-background/50 backdrop-blur-sm">
            <div className="p-3 rounded-xl bg-accent/10 text-accent mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg">Privacy & Sicurezza</h3>
            <p className="text-sm text-secondary mt-2">I tuoi dati sono protetti e archiviati in modo sicuro su Supabase.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
