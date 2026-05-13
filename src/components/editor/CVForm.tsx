'use client';

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase";
import { ResumeData } from "@/types/resume";
import PersonalInfoSection from "./PersonalInfoSection";
import ExperienceSection from "./ExperienceSection";
import EducationSection from "./EducationSection";
import SkillsSection from "./SkillsSection";
import CVImporter from "./CVImporter";
import { Save, Loader2 } from "lucide-react";

export default function CVForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { register, control, handleSubmit, reset } = useForm<ResumeData>({
    defaultValues: {
      personalInfo: { fullName: "", email: "", phone: "", location: "", summary: "" },
      experience: [],
      education: [],
      skills: [],
      languages: [],
    }
  });

  // Caricamento CV Base all'avvio
  useEffect(() => {
    async function loadBaseCV() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('cv_history')
        .select('base_cv_data')
        .eq('user_id', user.id)
        .eq('is_base', true)
        .single();

      if (data && !error) {
        reset(data.base_cv_data);
      }
      setLoading(false);
    }
    loadBaseCV();
  }, [reset]);

  const handleDataParsed = (data: ResumeData) => {
    reset(data);
  };

  const onSubmit = async (data: ResumeData) => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    // Upsert del CV Base (aggiorna se esiste, altrimenti crea)
    const { error } = await supabase
      .from('cv_history')
      .upsert({
        user_id: user.id,
        base_cv_data: data,
        optimized_cv_data: data, // Inizialmente uguale
        target_company: 'BASE',
        target_position: 'BASE',
        is_base: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,is_base' });

    if (error) {
      console.error("Errore salvataggio:", error);
      alert("Errore durante il salvataggio: " + error.message);
    } else {
      alert("CV Base salvato correttamente!");
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-accent" />
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto py-10 px-4 space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editor CV Base</h1>
          <p className="text-secondary">Inserisci i tuoi dati fondamentali per generare versioni ottimizzate.</p>
        </div>
        <button type="submit" className="btn-primary flex items-center gap-2">
          <Save className="w-4 h-4" /> Salva CV Base
        </button>
      </div>

      <CVImporter onDataParsed={handleDataParsed} />

      <PersonalInfoSection register={register} />
      <ExperienceSection register={register} control={control} />
      <EducationSection register={register} control={control} />
      <SkillsSection register={register} control={control} />
      
      <div className="flex justify-end pt-6">
        <button type="submit" className="btn-primary px-8 py-3 text-lg">
          Salva e Continua
        </button>
      </div>
    </form>
  );
}
