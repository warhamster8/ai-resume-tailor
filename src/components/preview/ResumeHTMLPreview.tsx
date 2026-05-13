'use client';

import { OptimizedResumeData } from '@/types/resume';
import { Mail, Phone, MapPin, Link as LinkIcon, Briefcase, GraduationCap, Code } from 'lucide-react';

interface Props {
  data: OptimizedResumeData;
  templateId: number;
}

export default function ResumeHTMLPreview({ data, templateId }: Props) {
  if (!data || !data.personalInfo) {
    return (
      <div className="p-8 text-center bg-white rounded-lg shadow">
        <p className="text-slate-500 italic">Dati del CV incompleti o in caricamento...</p>
      </div>
    );
  }

  return (
    <div
      id="resume-preview-content"
      className="bg-white w-full shadow-2xl mx-auto text-[#333] font-sans"
      style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
    >
      {/* Header */}
      <header className="px-10 pt-10 pb-6">
        <h1 className="text-4xl font-black tracking-tighter text-[#1a1a1a] uppercase leading-none mb-1">
          {data.personalInfo?.fullName || 'Nome non disponibile'}
        </h1>
        <p className="text-sm tracking-[0.2em] text-gray-500 uppercase font-medium">
          {data.personalInfo?.title || 'Professional'}
        </p>
        <div className="h-[2px] bg-[#1a1a1a] my-4" />
        <div className="flex flex-wrap gap-4 text-[11px] text-gray-600 font-medium">
          {data.personalInfo?.phone && (
            <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {data.personalInfo.phone}</span>
          )}
          {data.personalInfo?.email && (
            <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {data.personalInfo.email}</span>
          )}
          {data.personalInfo?.location && (
            <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {data.personalInfo.location}</span>
          )}
          {data.personalInfo?.linkedin && (
            <span className="flex items-center gap-1.5"><LinkIcon className="w-3 h-3" /> {data.personalInfo.linkedin}</span>
          )}
        </div>
      </header>

      {/* Profilo */}
      <div className="mx-10 mb-8 bg-[#2d2d2d] text-white p-6 rounded-sm">
        <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase mb-3 text-gray-400">Profilo</h2>
        <p className="text-sm leading-relaxed text-gray-100 italic">
          {data.personalInfo?.summary || ''}
        </p>
      </div>

      {/* Body: 2 colonne */}
      <div className="px-10 pb-10 grid grid-cols-[1fr_2fr] gap-10">
        {/* Colonna Sinistra */}
        <aside className="space-y-8">
          {data.education && data.education.length > 0 && (
            <section>
              <h3 className="text-[10px] font-black tracking-[0.2em] uppercase border-b-2 border-[#1a1a1a] pb-2 mb-4 flex items-center gap-2">
                <GraduationCap className="w-3.5 h-3.5" /> Istruzione
              </h3>
              <div className="space-y-4">
                {data.education.map((edu, i) => (
                  <div key={i}>
                    <p className="text-xs font-bold text-[#1a1a1a] leading-tight">{edu.degree}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{edu.school}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.skills && data.skills.length > 0 && (
            <section>
              <h3 className="text-[10px] font-black tracking-[0.2em] uppercase border-b-2 border-[#1a1a1a] pb-2 mb-4 flex items-center gap-2">
                <Code className="w-3.5 h-3.5" /> Skills
              </h3>
              <div className="space-y-3">
                {data.skills.map((skill, i) => (
                  <div key={i}>
                    <p className="text-[10px] font-bold text-[#1a1a1a] uppercase tracking-wider mb-1">{skill.name}</p>
                    <div className="h-1 bg-gray-100 overflow-hidden rounded-full">
                      <div
                        className="h-full bg-[#1a1a1a] rounded-full"
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
        <main>
          {data.experience && data.experience.length > 0 && (
            <section>
              <h3 className="text-[10px] font-black tracking-[0.2em] uppercase border-b-2 border-[#1a1a1a] pb-2 mb-6 flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5" /> Esperienza Lavorativa
              </h3>
              <div className="space-y-7">
                {data.experience.map((exp, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-start mb-0.5">
                      <h4 className="text-[12px] font-bold text-[#1a1a1a] uppercase tracking-tight">
                        {exp.position}
                      </h4>
                      <span className="text-[10px] text-gray-400 font-bold whitespace-nowrap ml-4">
                        {exp.startDate} — {exp.current ? 'Presente' : exp.endDate}
                      </span>
                    </div>
                    <p className="text-[11px] font-bold text-gray-500 italic mb-2">{exp.company}</p>
                    <p className="text-[11px] text-gray-600 leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Footer GDPR */}
      <footer className="mx-10 pb-6 pt-4 border-t border-gray-100">
        <p className="text-[8px] text-gray-400 text-center uppercase tracking-widest">
          Autorizzo il trattamento dei dati personali (D. Lgs. 196/2003 e GDPR 679/16).
        </p>
      </footer>
    </div>
  );
}
