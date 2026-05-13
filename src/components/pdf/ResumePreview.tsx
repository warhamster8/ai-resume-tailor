'use client';

import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { OptimizedResumeData } from '@/types/resume';
import ResumePDF from './ResumePDF';
import { useState } from 'react';
import { Download, Layout, Loader2, Eye, Zap, Info } from 'lucide-react';

interface Props {
  data: OptimizedResumeData;
}

const templates = [
  { id: 0, name: 'Master (Testo Originale)', color: '#666' },
  { id: 1, name: 'Professionale (IA)', color: '#0070f3' },
  { id: 4, name: 'Modern ATS (Harvard)', color: '#000' },
  { id: 2, name: 'Europass (Clean)', color: '#0056b3' },
  { id: 3, name: 'Executive Minimal', color: '#333' },
];

export default function ResumePreview({ data }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState(1);
  const [showDiff, setShowDiff] = useState(false);

  // Componente per mostrare i cambiamenti in modalità Web
  const DiffView = () => (
    <div className="bg-white p-10 max-w-4xl mx-auto shadow-xl rounded-xl border border-border space-y-8 text-[#333]">
      <div className="border-b-2 border-accent pb-4">
        <h1 className="text-3xl font-bold">{data.personalInfo.fullName}</h1>
        <p className="text-sm text-secondary mt-1">{data.personalInfo.email} • {data.personalInfo.phone} • {data.personalInfo.location}</p>
      </div>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider text-accent mb-3">Profilo</h2>
        <div className="relative group p-2 rounded hover:bg-yellow-50 transition-colors">
          <p className="leading-relaxed">{data.personalInfo.summary}</p>
          {(data.personalInfo as any)._metadata && (
            <div className="absolute left-full ml-4 top-0 w-64 p-3 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-xl pointer-events-none">
              <p className="font-bold mb-1 text-yellow-400">Modifica IA:</p>
              <p className="mb-2 italic text-gray-300">Originale: {(data.personalInfo as any)._metadata.original}</p>
              <p className="text-accent-foreground font-medium">Razione: {(data.personalInfo as any)._metadata.reason}</p>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-accent border-b border-border pb-1">Esperienza</h2>
        {data.experience.map((exp: any, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between items-baseline">
              <div className="relative group flex items-center gap-2">
                <h3 className="font-bold text-lg">{exp.position}</h3>
                {exp._metadata?.originalPosition && exp.position !== exp._metadata.originalPosition && (
                  <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                )}
                {exp._metadata && (
                  <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50">
                    <p className="font-bold text-yellow-400">Titolo Modificato:</p>
                    <p className="italic text-gray-300">Era: {exp._metadata.originalPosition}</p>
                  </div>
                )}
              </div>
              <span className="text-sm font-bold text-secondary">{exp.startDate} — {exp.current ? 'Presente' : exp.endDate}</span>
            </div>
            <p className="font-medium text-accent">{exp.company}</p>
            <div className="relative group p-2 rounded hover:bg-yellow-50 transition-colors">
              <p className="text-sm leading-relaxed">{exp.description}</p>
              {exp._metadata && (
                <div className="absolute left-full ml-4 top-0 w-80 p-4 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-2xl pointer-events-none">
                  <p className="font-bold mb-2 text-yellow-400">Riformulazione Strategica:</p>
                  <p className="text-accent-foreground">{exp._metadata.reason}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-muted/30">
      <div className="bg-background border-b border-border p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
            <button 
              onClick={() => setShowDiff(false)}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${!showDiff ? 'bg-white shadow-sm text-accent' : 'text-secondary hover:text-foreground'}`}
            >
              <Eye className="w-3 h-3" /> PDF Pronto
            </button>
            <button 
              onClick={() => setShowDiff(true)}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${showDiff ? 'bg-white shadow-sm text-yellow-600' : 'text-secondary hover:text-foreground'}`}
            >
              <Zap className="w-3 h-3" /> Revisione IA
            </button>
          </div>

          {!showDiff && (
            <div className="flex gap-2">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-all ${
                    selectedTemplate === t.id 
                      ? 'bg-accent text-white border-accent shadow-md' 
                      : 'bg-white border-border text-secondary hover:border-accent/50'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {showDiff && (
            <span className="text-[10px] text-secondary flex items-center gap-1 animate-pulse">
              <Info className="w-3 h-3" /> Passa il mouse sulle parti evidenziate per vedere il "Perché"
            </span>
          )}
          <PDFDownloadLink 
            document={<ResumePDF data={data} templateId={selectedTemplate} />} 
            fileName={`CV_Ottimizzato_${data.personalInfo.fullName.replace(/\s+/g, '_')}.pdf`}
            className="btn-primary flex items-center gap-2 text-sm shadow-lg shadow-accent/20"
          >
            {({ loading }) => (
              loading ? <><Loader2 className="w-4 h-4 animate-spin" /> ...</> : <><Download className="w-4 h-4" /> Esporta PDF</>
            )}
          </PDFDownloadLink>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        {showDiff ? (
          <DiffView />
        ) : (
          <div className="w-full max-w-5xl mx-auto h-[1100px] shadow-2xl rounded-lg overflow-hidden bg-white">
            <PDFViewer width="100%" height="100%" showToolbar={false}>
              <ResumePDF data={data} templateId={selectedTemplate} />
            </PDFViewer>
          </div>
        )}
      </div>
    </div>
  );
}
