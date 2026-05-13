'use client';

import Link from 'next/link';
import { FileText, LayoutDashboard, User, LogOut, Wand2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [session, setSession] = useState<any>(null);
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!mounted) return (
    <nav className="border-b border-border bg-background sticky top-0 z-50 h-16" />
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <nav className="border-b border-border bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2">
            <FileText className="w-8 h-8 text-accent" />
            <span className="text-xl font-bold tracking-tight">AI Resume Tailor</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            {session && (
              <>
                <Link href="/dashboard" className="text-sm font-medium hover:text-accent transition-colors flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link href="/editor" className="text-sm font-medium hover:text-accent transition-colors flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  CV Base
                </Link>
                <Link href="/optimize" className="text-sm font-medium hover:text-accent transition-colors flex items-center gap-2">
                  <Wand2 className="w-4 h-4" />
                  Ottimizza
                </Link>
                <Link href="/profile" className="text-sm font-medium hover:text-accent transition-colors flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Profilo
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            {session ? (
              <button 
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-red-500/10 text-secondary hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            ) : (
              <Link href="/login" className="text-sm font-bold text-accent">
                Accedi
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
