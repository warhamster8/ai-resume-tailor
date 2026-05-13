import { UseFormRegister } from "react-hook-form";
import { ResumeData } from "@/types/resume";

interface Props {
  register: UseFormRegister<ResumeData>;
}

export default function PersonalInfoSection({ register }: Props) {
  return (
    <div className="crisp-card p-6 space-y-4">
      <h2 className="text-xl font-bold border-b border-border pb-2">Informazioni Personali</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Nome Completo</label>
          <input
            {...register("personalInfo.fullName")}
            className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-accent outline-none"
            placeholder="Mario Rossi"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <input
            {...register("personalInfo.email")}
            type="email"
            className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-accent outline-none"
            placeholder="mario.rossi@example.com"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Telefono</label>
          <input
            {...register("personalInfo.phone")}
            className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-accent outline-none"
            placeholder="+39 123 456 7890"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Località</label>
          <input
            {...register("personalInfo.location")}
            className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-accent outline-none"
            placeholder="Milano, Italia"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">LinkedIn</label>
          <input
            {...register("personalInfo.linkedin")}
            className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-accent outline-none"
            placeholder="linkedin.com/in/mariorossi"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Sito Web / Portfolio</label>
          <input
            {...register("personalInfo.website")}
            className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-accent outline-none"
            placeholder="mariorossi.com"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Riepilogo Professionale</label>
        <textarea
          {...register("personalInfo.summary")}
          rows={4}
          className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-accent outline-none resize-none"
          placeholder="Breve descrizione del tuo profilo professionale..."
        />
      </div>
    </div>
  );
}
