'use client';

import { PDFViewer } from '@react-pdf/renderer';
import { OptimizedResumeData } from '@/types/resume';
import ResumePDF from './ResumePDF';
import { useState } from 'react';
import { Download, Layout } from 'lucide-react';

interface Props {
  data: OptimizedResumeData;
}

const templates = [
  { id: 1, name: 'Professional', color: '#0070f3' },
  { id: 2, name: 'Minimal', color: '#333' },
  { id: 3, name: 'Creative', color: '#e91e63' },
  { id: 4, name: 'Modern', color: '#4caf50' },
  { id: 5, name: 'Executive', color: '#3f51b5' },
  { id: 6, name: 'Tech', color: '#00bcd4' },
];

export default function ResumePreview({ data }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState(1);

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-background border-b border-border p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium flex items-center gap-2">
            <Layout className="w-4 h-4" /> Template:
          </span>
          <div className="flex gap-2">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTemplate(t.id)}
                className={`px-3 py-1 text-xs rounded-full border transition-all ${
                  selectedTemplate === t.id 
                    ? 'bg-accent text-white border-accent' 
                    : 'border-border hover:bg-muted'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Download className="w-4 h-4" /> Esporta PDF
        </button>
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
