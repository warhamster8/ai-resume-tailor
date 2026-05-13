import Link from 'next/link';
import { FileText, LayoutDashboard, Settings, User } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="border-b border-border bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <FileText className="w-8 h-8 text-accent" />
            <span className="text-xl font-bold tracking-tight">AI Resume Tailor</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="/dashboard" className="text-sm font-medium hover:text-accent transition-colors flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link href="/editor" className="text-sm font-medium hover:text-accent transition-colors flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Nuovo CV
            </Link>
            <Link href="/profile" className="text-sm font-medium hover:text-accent transition-colors flex items-center gap-2">
              <User className="w-4 h-4" />
              Profilo
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-muted transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold">
              U
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
