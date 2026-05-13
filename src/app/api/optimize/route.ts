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

    const systemPrompt = `Sei un Senior Executive Recruiter. Ottimizza il CV per "${jobTitle}" in lingua ${targetLanguage}.

REGOLE DI REBRANDING TITOLI (CRITICO):
- NON usare il Job Title target ("${jobTitle}") in modo identico nelle tue esperienze passate se non è vero. È sospetto e poco credibile.
- Usa titoli che siano "ponti" verso il ruolo target. Esempio: Se punta a "Project Manager", usa "Lead Implementation Specialist" o "Operations Coordinator" per le esperienze passate, non "Project Manager" ovunque.
- Il rebranding deve essere sottile e basato sui fatti reali della descrizione.

REGOLE COMPETENZE (SKILLS):
- Riscrivi e riorganizza la lista delle competenze.
- LIVELLI REALISTICI: NON mettere tutto come "Expert". Usa un mix bilanciato (Intermediate, Advanced, Expert). Sii onesto e credibile.
- AGGIUNGI SEMPRE (se pertinente): "AI-Assisted Development" o "Vibe-Coding / Prompt Engineering" come competenza, riflettendo la capacità dell'utente di usare l'IA per velocizzare i processi.
- Dai priorità alle skill più rilevanti per la Job Description fornita.
- Deduci skill realistiche (es. se usa Teamcenter, deduci "PLM Management").

REGOLE GENERALI:
- NO CERTIFICAZIONI FALSE.
- LINGUA: Tutto in ${targetLanguage}.
- RISPONDI SOLO CON JSON.`;

    const userPrompt = `
    Dati base: ${JSON.stringify(baseData)}
    Esperienze: ${JSON.stringify(experienceWithIndex)}
    Job Description: ${jobDescription}
    
    Struttura:
    {
      "personalInfo": { "summary": "...", "originalSummary": "...", "changeReason": "..." },
      "experience": [
        { "index": 0, "newPosition": "Titolo credibile e non forzato", "originalPosition": "...", "newDescription": "...", "originalDescription": "...", "changeReason": "..." }
      ],
      "skills": [ { "name": "Skill ottimizzata", "level": "Livello" } ],
      "atsScore": 95
    }`;

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
        temperature: 0.25,
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
    return NextResponse.json({ message: "Errore IA" }, { status: 500 });
  }
}
