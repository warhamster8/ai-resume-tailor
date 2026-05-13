'use client';

import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { OptimizedResumeData } from '@/types/resume';
import ResumePDF from './ResumePDF';
import { useState } from 'react';
import { Download, Layout, Loader2 } from 'lucide-react';

interface Props {
  data: OptimizedResumeData;
}

const templates = [
  { id: 1, name: 'Modern ATS (Harvard)', color: '#000' },
  { id: 2, name: 'Europass (Clean)', color: '#0056b3' },
  { id: 3, name: 'Executive Minimal', color: '#333' },
];

export default function ResumePreview({ data }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState(1);

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-background border-b border-border p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium flex items-center gap-2">
            <Layout className="w-4 h-4 text-accent" /> Template:
          </span>
          <div className="flex gap-2">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTemplate(t.id)}
                className={`px-3 py-1 text-xs rounded-full border transition-all ${
                  selectedTemplate === t.id 
                    ? 'bg-accent text-white border-accent shadow-sm' 
                    : 'border-border hover:bg-muted text-secondary'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <PDFDownloadLink 
          document={<ResumePDF data={data} templateId={selectedTemplate} />} 
          fileName={`CV_Ottimizzato_${data.personalInfo.fullName.replace(/\s+/g, '_')}.pdf`}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          {({ loading }) => (
            loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generazione...</>
            ) : (
              <><Download className="w-4 h-4" /> Esporta PDF</>
            )
          )}
        </PDFDownloadLink>
      </div>

      <div className="flex-1 bg-muted/50 p-8 flex justify-center">
        <div className="w-full max-w-4xl h-full shadow-2xl rounded-lg overflow-hidden bg-white">
          <PDFViewer width="100%" height="100%" showToolbar={false}>
            <ResumePDF data={data} templateId={selectedTemplate} />
          </PDFViewer>
        </div>
      </div>
    </div>
  );
}
