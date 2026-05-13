'use client';

import { useState } from 'react';
import { Upload, FileUp, Loader2, CheckCircle2 } from 'lucide-react';
import { ResumeData } from '@/types/resume';

interface Props {
  onDataParsed: (data: ResumeData) => void;
}

export default function CVImporter({ onDataParsed }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'parsing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setStatus('parsing');
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/parse', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Errore nel caricamento');
      }

      onDataParsed(data);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || 'Si è verificato un errore durante l\'importazione.');
      setStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="crisp-card p-6 bg-accent/5 border-accent/20 border-dashed border-2 relative overflow-hidden">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
            {status === 'parsing' ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : status === 'success' ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <FileUp className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="font-bold">Importa CV esistente</h3>
            <p className="text-sm text-secondary">
              {status === 'parsing' 
                ? 'L\'IA sta analizzando il tuo CV...' 
                : 'Carica un PDF per compilare il form automaticamente.'}
            </p>
          </div>
        </div>
        
        <label className={`btn-primary flex items-center gap-2 cursor-pointer transition-all ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
          <Upload className="w-4 h-4" />
          {isUploading ? 'Caricamento...' : 'Seleziona PDF'}
          <input 
            type="file" 
            className="hidden" 
            accept=".pdf" 
            onChange={handleFileUpload}
            disabled={isUploading}
          />
        </label>
      </div>

      {status === 'error' && (
        <p className="text-xs text-red-500 mt-2">
          {errorMessage || 'Si è verificato un errore durante l\'importazione. Riprova con un altro file.'}
        </p>
      )}
    </div>
  );
}
