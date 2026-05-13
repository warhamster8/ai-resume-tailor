import { Control, useFieldArray, UseFormRegister } from "react-hook-form";
import { ResumeData } from "@/types/resume";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  register: UseFormRegister<ResumeData>;
  control: Control<ResumeData>;
}

export default function ExperienceSection({ register, control }: Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "experience",
  });

  return (
    <div className="crisp-card p-6 space-y-6">
      <div className="flex justify-between items-center border-b border-border pb-2">
        <h2 className="text-xl font-bold">Esperienza Lavorativa</h2>
        <button
          type="button"
          onClick={() => append({ id: crypto.randomUUID(), company: "", position: "", startDate: "", endDate: "", current: false, description: "", highlights: [] })}
          className="flex items-center gap-1 text-sm font-medium text-accent hover:underline"
        >
          <Plus className="w-4 h-4" /> Aggiungi Esperienza
        </button>
      </div>

      <div className="space-y-8">
        {fields.map((field, index) => (
          <div key={field.id} className="relative space-y-4 p-4 border border-border rounded-lg bg-muted/20">
            <button
              type="button"
              onClick={() => remove(index)}
              className="absolute top-2 right-2 p-1 text-secondary hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Azienda</label>
                <input
                  {...register(`experience.${index}.company`)}
                  className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-accent outline-none"
                  placeholder="Nome azienda"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Posizione</label>
                <input
                  {...register(`experience.${index}.position`)}
                  className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-accent outline-none"
                  placeholder="E.g. Senior Software Engineer"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Inizio</label>
                <input
                  {...register(`experience.${index}.startDate`)}
                  type="month"
                  className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-accent outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Fine</label>
                <input
                  {...register(`experience.${index}.endDate`)}
                  type="month"
                  disabled={fields[index].current}
                  className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-accent outline-none disabled:opacity-50"
                />
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="checkbox"
                    {...register(`experience.${index}.current`)}
                    id={`current-${index}`}
                  />
                  <label htmlFor={`current-${index}`} className="text-xs text-secondary">Lavoro attuale</label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Descrizione</label>
              <textarea
                {...register(`experience.${index}.description`)}
                rows={3}
                className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-accent outline-none resize-none"
                placeholder="Descrivi le tue responsabilità e i tuoi successi..."
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
