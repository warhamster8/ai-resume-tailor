import { Control, useFieldArray, UseFormRegister } from "react-hook-form";
import { ResumeData } from "@/types/resume";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  register: UseFormRegister<ResumeData>;
  control: Control<ResumeData>;
}

export default function EducationSection({ register, control }: Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "education",
  });

  return (
    <div className="crisp-card p-6 space-y-6">
      <div className="flex justify-between items-center border-b border-border pb-2">
        <h2 className="text-xl font-bold">Formazione</h2>
        <button
          type="button"
          onClick={() => append({ id: crypto.randomUUID(), school: "", degree: "", field: "", startDate: "", endDate: "" })}
          className="flex items-center gap-1 text-sm font-medium text-accent hover:underline"
        >
          <Plus className="w-4 h-4" /> Aggiungi Formazione
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
                <label className="text-sm font-medium">Istituto / Università</label>
                <input
                  {...register(`education.${index}.school`)}
                  className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-accent outline-none"
                  placeholder="Nome istituto"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Titolo di Studio</label>
                <input
                  {...register(`education.${index}.degree`)}
                  className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-accent outline-none"
                  placeholder="E.g. Laurea Magistrale"
                />
              </div>
              <div className="space-y-2 text-sm font-medium">Campo di Studio</div>
                <input
                  {...register(`education.${index}.field`)}
                  className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-accent outline-none"
                  placeholder="E.g. Ingegneria Informatica"
                />
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data Inizio</label>
                  <input
                    {...register(`education.${index}.startDate`)}
                    type="month"
                    className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-accent outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data Fine</label>
                  <input
                    {...register(`education.${index}.endDate`)}
                    type="month"
                    className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-accent outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
