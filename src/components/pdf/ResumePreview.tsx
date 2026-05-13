'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { OptimizedResumeData } from '@/types/resume';

const PDFViewer = dynamic(() => import('@react-pdf/renderer').then(mod => mod.PDFViewer), {
  ssr: false,
});

const ResumePDF = dynamic(() => import('./ResumePDF'), { ssr: false });

interface Props {
  data: OptimizedResumeData;
}

export default function ResumePreview({ data }: Props) {
  const [templateId, setTemplateId] = useState(7);
  const [showAIInsights, setShowAIInsights] = useState(true);

  const templates = [
    { id: 7, name: '🏆 Elite Portfolio', color: '#1a1a1a' },
    { id: 2, name: '🔵 Modern Blue', color: '#1d4ed8' },
    { id: 5, name: '🟢 Emerald Executive', color: '#064e3b' },
    { id: 6, name: '🩶 Slate Modern', color: '#334155' },
    { id: 0, name: '📋 Testo Originale', color: '#666' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-100 rounded-xl shadow-inner border border-slate-200">
      
      <div className="bg-white p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20">
        <div className="flex items-center gap-2">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => setTemplateId(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                templateId === t.id 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
        
        <label className="flex items-center gap-2 cursor-pointer group">
          <div className="relative">
            <input type="checkbox" checked={showAIInsights} onChange={(e) => setShowAIInsights(e.target.checked)} className="sr-only" />
            <div className={`w-10 h-5 rounded-full transition-colors ${showAIInsights ? 'bg-amber-500' : 'bg-slate-300'}`}></div>
            <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${showAIInsights ? 'translate-x-5' : ''}`}></div>
          </div>
          <span className="text-xs font-bold text-slate-600">Revisione IA</span>
        </label>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-12 flex justify-center bg-slate-200/50">
        <div className="relative bg-white shadow-2xl">
          
          {showAIInsights && (
            <div className="absolute inset-0 z-10 pointer-events-none">
              <div className="p-[45pt_40pt] h-full w-full">
                
                {/* SUGGERIMENTO PROFILO - POSIZIONATO SOPRA */}
                <div className="relative group pointer-events-auto cursor-help mb-12">
                  <div className="absolute -inset-2 bg-amber-400/10 border-2 border-dashed border-amber-400/30 rounded-lg"></div>
                  
                  {/* FUMETTO POSIZIONATO IN ALTO AL CENTRO */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-72 bg-slate-900/95 backdrop-blur-md text-white p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] opacity-0 group-hover:opacity-100 transition-all pointer-events-none translate-y-2 group-hover:translate-y-0 z-50 border border-slate-700">
                    <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-2">💡 Ottimizzazione Profilo</p>
                    <p className="text-xs leading-relaxed text-slate-100">{data.personalInfo?._metadata?.reason || "Ho riscritto il sommario per evidenziare le tue competenze PLM e Digital Transformation."}</p>
                    {/* Triangolino in basso */}
                    <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 rotate-45 border-b border-r border-slate-700"></div>
                  </div>
                </div>

                {/* SUGGERIMENTI ESPERIENZE - POSIZIONATI SOPRA */}
                <div className="mt-40 space-y-24">
                  {(data.experience || []).map((exp: any, i: number) => (
                    <div key={i} className="relative group pointer-events-auto cursor-help">
                       {exp.position !== exp._metadata?.originalPosition && (
                         <>
                           <div className="absolute -inset-2 bg-blue-400/5 border border-dashed border-blue-400/20 rounded"></div>
                           <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 bg-slate-900/95 backdrop-blur-md text-white p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] opacity-0 group-hover:opacity-100 transition-all pointer-events-none translate-y-2 group-hover:translate-y-0 z-50 border border-slate-700">
                              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">🔄 Rebranding Titolo</p>
                              <div className="bg-slate-800 p-2 rounded-lg mb-3">
                                <p className="text-[10px] text-slate-400 uppercase mb-1">Originale</p>
                                <p className="text-xs font-bold text-slate-300">{exp._metadata?.originalPosition}</p>
                              </div>
                              <p className="text-xs text-slate-100">"{exp._metadata?.reason || "Titolo standardizzato per il mercato."}"</p>
                              <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 rotate-45 border-b border-r border-slate-700"></div>
                           </div>
                         </>
                       )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <PDFViewer width="800px" height="1132px" showToolbar={false} className="border-none">
            <ResumePDF data={data} templateId={templateId} />
          </PDFViewer>
        </div>
      </div>
    </div>
  );
}
