import { Control, useFieldArray, UseFormRegister } from "react-hook-form";
import { ResumeData } from "@/types/resume";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  register: UseFormRegister<ResumeData>;
  control: Control<ResumeData>;
}

export default function SkillsSection({ register, control }: Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "skills",
  });

  return (
    <div className="crisp-card p-6 space-y-6">
      <div className="flex justify-between items-center border-b border-border pb-2">
        <h2 className="text-xl font-bold">Competenze</h2>
        <button
          type="button"
          onClick={() => append({ name: "", level: "Intermediate" })}
          className="flex items-center gap-1 text-sm font-medium text-accent hover:underline"
        >
          <Plus className="w-4 h-4" /> Aggiungi Competenza
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2 p-3 border border-border rounded-lg bg-muted/20">
            <div className="flex-1 space-y-1">
              <input
                {...register(`skills.${index}.name`)}
                className="w-full text-sm font-medium bg-transparent border-none focus:ring-0 outline-none"
                placeholder="E.g. React, Python, Project Management..."
              />
              <select
                {...register(`skills.${index}.level`)}
                className="text-xs text-secondary bg-transparent border-none focus:ring-0 outline-none"
              >
                <option value="Beginner">Base</option>
                <option value="Intermediate">Intermedio</option>
                <option value="Advanced">Avanzato</option>
                <option value="Expert">Esperto</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => remove(index)}
              className="p-1 text-secondary hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
