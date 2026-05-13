'use client';

import { useForm } from "react-hook-form";
import { ResumeData } from "@/types/resume";
import PersonalInfoSection from "./PersonalInfoSection";
import ExperienceSection from "./ExperienceSection";
import EducationSection from "./EducationSection";
import SkillsSection from "./SkillsSection";
import { Save } from "lucide-react";

export default function CVForm() {
  const { register, control, handleSubmit, watch } = useForm<ResumeData>({
    defaultValues: {
      personalInfo: {
        fullName: "",
        email: "",
        phone: "",
        location: "",
        summary: "",
      },
      experience: [],
      education: [],
      skills: [],
      languages: [],
    }
  });

  const onSubmit = (data: ResumeData) => {
    console.log("Saving CV Data:", data);
    // Logic to save to Supabase will go here
  };

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
