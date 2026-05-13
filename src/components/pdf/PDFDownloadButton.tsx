'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { OptimizedResumeData } from '@/types/resume';
import { Download, Loader2 } from 'lucide-react';

const PDFDownloadLink = dynamic(() => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink), {
  ssr: false,
});

const ResumePDF = dynamic(() => import('./ResumePDF'), { ssr: false });

interface Props {
  data: OptimizedResumeData;
  fileName?: string;
}

export default function PDFDownloadButton({ data, fileName = 'resume.pdf' }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return (
    <div className="bg-slate-100 text-slate-400 px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2">
      <Loader2 className="w-4 h-4 animate-spin" /> Inizializzazione...
    </div>
  );

  return (
    <div className="relative inline-block">
      <PDFDownloadLink
        document={<ResumePDF data={data} templateId={7} />}
        fileName={fileName}
        className={`bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95`}
      >
        {({ blob, url, loading, error }) => {
           if (loading) return (
             <>
               <Loader2 className="w-4 h-4 animate-spin" />
               Preparazione...
             </>
           );
           if (error) {
             console.error("PDF Generation Error:", error);
             return "Errore PDF";
           }
           return (
             <>
               <Download className="w-4 h-4" />
               Scarica PDF
             </>
           );
        }}
      </PDFDownloadLink>
    </div>
  );
}
