'use client';

import { OptimizedResumeData } from '@/types/resume';
import { Mail, Phone, MapPin, Globe, Link as LinkIcon, Briefcase, GraduationCap, Code } from 'lucide-react';

interface Props {
  data: OptimizedResumeData;
  templateId: number;
}

export default function ResumeHTMLPreview({ data, templateId }: Props) {
  const isElite = templateId === 7;
  const isSlate = templateId === 6;
  
  // Per semplicità iniziamo con il layout Elite (quello di default)
  // che è quello più richiesto dall'utente.
  
  if (!data || !data.personalInfo) {
    return (
      <div className="p-8 text-center bg-white rounded-lg shadow">
        <p className="text-slate-500 italic">Dati del CV incompleti o in caricamento...</p>
      </div>
    );
  }

  return (
    <div className="bg-white w-full max-w-[210mm] min-h-[297mm] shadow-2xl mx-auto p-[10mm] md:p-[15mm] text-[#333] font-sans overflow-hidden">
      {/* Header */}
      <header className="mb-8 text-center lg:text-left">
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-[#1a1a1a] uppercase leading-none mb-2">
          {data.personalInfo?.fullName || 'Nome non disponibile'}
        </h1>
        <p className="text-sm tracking-[0.2em] text-gray-500 uppercase font-medium">
          {data.personalInfo?.title || 'Professional'}
        </p>
        
        <div className="h-[2px] bg-[#1a1a1a] my-6" />
        
        <div className="flex flex-wrap justify-center lg:justify-between gap-4 text-[10px] text-gray-600 font-medium">
          {data.personalInfo?.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="w-3 h-3" /> {data.personalInfo.phone}
            </div>
          )}
          {data.personalInfo?.email && (
            <div className="flex items-center gap-1.5">
              <Mail className="w-3 h-3" /> {data.personalInfo.email}
            </div>
          )}
          {data.personalInfo?.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3" /> {data.personalInfo.location}
            </div>
          )}
          {data.personalInfo?.linkedin && (
            <div className="flex items-center gap-1.5">
              <LinkIcon className="w-3 h-3" /> {data.personalInfo.linkedin}
            </div>
          )}
        </div>
      </header>

      {/* Profilo Professionale */}
      <section className="bg-[#2d2d2d] text-white p-6 md:p-8 mb-10 rounded-sm">
        <h2 className="text-xs font-bold tracking-[0.2em] uppercase mb-4 text-gray-400">Profilo</h2>
        <p className="text-sm leading-relaxed text-gray-100 italic">
          {data.personalInfo?.summary || 'Nessun profilo professionale disponibile.'}
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 md:gap-12">
        {/* Colonna Sinistra */}
        <aside className="space-y-10">
          {/* Istruzione */}
          {data.education && data.education.length > 0 && (
            <section>
              <h3 className="text-xs font-black tracking-[0.2em] uppercase border-b-2 border-[#1a1a1a] pb-2 mb-6 flex items-center gap-2">
                <GraduationCap className="w-4 h-4" /> Istruzione
              </h3>
              <div className="space-y-6">
                {data.education.map((edu, i) => (
                  <div key={i}>
                    <p className="text-xs font-bold text-[#1a1a1a] leading-tight">{edu.degree}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{edu.school}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills */}
          {data.skills && data.skills.length > 0 && (
            <section>
              <h3 className="text-xs font-black tracking-[0.2em] uppercase border-b-2 border-[#1a1a1a] pb-2 mb-6 flex items-center gap-2">
                <Code className="w-4 h-4" /> Skills
              </h3>
              <div className="space-y-4">
                {data.skills.map((skill, i) => (
                  <div key={i} className="space-y-1.5">
                    <p className="text-[10px] font-bold text-[#1a1a1a] uppercase tracking-wider">{skill.name}</p>
                    <div className="h-1 bg-gray-100 overflow-hidden">
                      <div 
                        className="h-full bg-[#1a1a1a]" 
                        style={{ 
                          width: skill.level === 'Expert' ? '100%' : 
                                 skill.level === 'Advanced' ? '85%' : 
                                 skill.level === 'Intermediate' ? '65%' : '40%' 
                        }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </aside>

        {/* Colonna Destra */}
        <main className="space-y-10">
          {data.experience && data.experience.length > 0 && (
            <section>
              <h3 className="text-xs font-black tracking-[0.2em] uppercase border-b-2 border-[#1a1a1a] pb-2 mb-6 flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Esperienza Lavorativa
              </h3>
              <div className="space-y-8">
                {data.experience.map((exp, i) => (
                  <div key={i} className="relative">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-bold text-[#1a1a1a] uppercase tracking-tight">
                        {exp.position}
                      </h4>
                      <span className="text-[10px] text-gray-400 font-bold whitespace-nowrap ml-4">
                        {exp.startDate} — {exp.current ? 'Presente' : exp.endDate}
                      </span>
                    </div>
                    <p className="text-[11px] font-bold text-gray-500 italic mb-3">{exp.company}</p>
                    <p className="text-[11px] text-gray-600 leading-relaxed text-justify">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Footer / GDPR */}
      <footer className="mt-16 pt-8 border-t border-gray-100">
        <p className="text-[8px] text-gray-400 text-center uppercase tracking-widest leading-relaxed">
          Autorizzo il trattamento dei dati personali (D. Lgs. 196/2003 e GDPR 679/16).
        </p>
      </footer>
    </div>
  );
}
