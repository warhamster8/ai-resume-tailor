'use client';

import { OptimizedResumeData } from '@/types/resume';
import { Download } from 'lucide-react';

interface Props {
  data: OptimizedResumeData;
  fileName?: string;
}

export default function PDFDownloadButton({ data, fileName = 'resume.pdf' }: Props) {
  const handlePrint = () => {
    // Apre una finestra con solo il CV e lancia la stampa
    const content = document.getElementById('resume-preview-content');
    if (!content) {
      alert('Anteprima non disponibile. Genera prima un CV ottimizzato.');
      return;
    }

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      alert('Popup bloccato. Permetti i popup per questo sito e riprova.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="it">
      <head>
        <meta charset="UTF-8" />
        <title>${fileName.replace('.pdf', '')}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Helvetica, Arial, sans-serif; color: #333; background: white; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            @page { size: A4; margin: 0; }
          }
        </style>
        <link rel="stylesheet" href="${window.location.origin}/_next/static/css/app/layout.css" />
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        ${content.outerHTML}
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); window.close(); }, 500);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <button
      onClick={handlePrint}
      className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95"
    >
      <Download className="w-4 h-4" />
      Scarica PDF
    </button>
  );
}
