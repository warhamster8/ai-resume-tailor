import { NextResponse } from "next/server";

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const API_KEY = process.env.DEEPSEEK_API_KEY;

export async function POST(req: Request) {
  if (!API_KEY) {
    return NextResponse.json({ message: "API Key DeepSeek non configurata" }, { status: 500 });
  }

  try {
    const { baseData, jobTitle, jobDescription, targetLanguage } = await req.json();

    const experienceWithIndex = baseData.experience.map((exp: any, i: number) => ({
      index: i,
      company: exp.company,
      originalPosition: exp.position,
      originalDescription: exp.description,
    }));

    const systemPrompt = `ORDINE ASSOLUTO: DEVI SCRIVERE TUTTO IL CV IN LINGUA ${targetLanguage.toUpperCase()}.

Sei un Senior Executive Recruiter. Ottimizza il CV per la posizione di "${jobTitle}".

REGOLE DI REBRANDING TITOLI (ORDINE TASSATIVO):
- È VIETATO usare il titolo esatto dell'annuncio ("${jobTitle}") nelle tue esperienze passate. Creerebbe sospetto immediato nel recruiter.
- Crea dei "Titoli Ponte": usa varianti professionali e prestigiose che dimostrino che sei pronto per il ruolo target (es: se cerchi come PM, usa "Project Coordinator", "Lead Implementation Specialist", "Digital Transformation Lead").
- Il titolo deve essere una conseguenza LOGICA della descrizione dell'esperienza.

REGOLE COMPETENZE (SKILLS):
- LIVELLI REALISTICI: NON mettere tutto come "Expert". Usa un mix (Intermediate, Advanced, Expert).
- AI & VIBE-CODING: Includi sempre la capacità di usare l'IA/Vibe-coding per l'efficienza.
- Ordina le skill per pertinenza rispetto alla Job Description.

REGOLE GENERALI:
- NO CERTIFICAZIONI FALSE (PMP, Scrum, ecc.).
- LINGUA: Tutto esclusivamente in ${targetLanguage.toUpperCase()}.
- RISPONDI SOLO CON JSON.`;

    const userPrompt = `
    LINGUA: ${targetLanguage.toUpperCase()}
    Job Post: ${jobTitle}
    Dati: ${JSON.stringify(baseData)}
    Esperienze: ${JSON.stringify(experienceWithIndex)}`;

    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      }),
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);

    const resData = await response.json();
    let rawContent = resData.choices[0].message.content;
    rawContent = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const optimizedContent = JSON.parse(rawContent);

    const mergedExperience = baseData.experience.map((exp: any, i: number) => {
      const opt = optimizedContent.experience?.find((e: any) => e.index === i) || optimizedContent.experience?.[i];
      if (opt) {
        return {
          ...exp,
          position: opt.newPosition || exp.position,
          description: opt.newDescription || exp.description,
          _metadata: {
            originalPosition: opt.originalPosition || exp.position,
            originalDescription: opt.originalDescription || exp.description,
            reason: opt.changeReason || "",
          },
        };
      }
      return exp;
    });

    return NextResponse.json({
      ...baseData,
      personalInfo: {
        ...baseData.personalInfo,
        summary: optimizedContent.personalInfo?.summary || baseData.personalInfo.summary,
        _metadata: {
          original: optimizedContent.personalInfo?.originalSummary || baseData.personalInfo.summary,
          reason: optimizedContent.personalInfo?.changeReason || "",
        },
      },
      experience: mergedExperience,
      skills: optimizedContent.skills || baseData.skills,
      atsScore: optimizedContent.atsScore || 70,
    });

  } catch (error) {
    console.error("Optimization Error:", error);
    return NextResponse.json({ message: "Errore durante l'ottimizzazione." }, { status: 500 });
  }
}
