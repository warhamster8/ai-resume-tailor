import { ResumeData, OptimizedResumeData } from "@/types/resume";

export async function optimizeResume(
  baseData: ResumeData,
  jobDescription: string
): Promise<OptimizedResumeData> {
  const response = await fetch("/api/optimize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ baseData, jobDescription }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Errore durante l'ottimizzazione");
  }

  return response.json();
}
