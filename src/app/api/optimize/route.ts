import { NextResponse } from "next/server";
import { ResumeData } from "@/types/resume";

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const API_KEY = process.env.DEEPSEEK_API_KEY;

export async function POST(req: Request) {
  if (!API_KEY) {
    return NextResponse.json(
      { message: "API Key DeepSeek non configurata" },
      { status: 500 }
    );
  }

  try {
    const { baseData, jobDescription } = await req.json();

    const systemPrompt = `Sei un esperto Senior HR e specialista certificato in sistemi ATS (Applicant Tracking System). 
    Il tuo obiettivo è riscrivere le sezioni del CV dell'utente per massimizzare la compatibilità con una specifica Job Description (JD).

    LINEE GUIDA CRITICHE PER L'OTTIMIZZAZIONE:
    1. KEYWORDS: Identifica le "hard skills" e le parole chiave tecniche nella JD e integrane il maggior numero possibile nel CV in modo naturale.
    2. VERBI D'AZIONE: Inizia ogni punto dell'esperienza lavorativa con verbi d'azione forti (es: Implementato, Guidato, Massimizzato, Progettato).
    3. TENSIONE AI RISULTATI: Trasforma compiti generici in risultati misurabili dove possibile.
    4. TERMINOLOGIA: Usa l'esatta terminologia usata nella JD (es: se chiedono "Cloud Native", non scrivere solo "Cloud").
    5. NO INVENZIONI: Non aggiungere mai esperienze che l'utente non ha. Enfatizza solo quelle esistenti.
    6. FORMATO: Restituisci un JSON puro che mappa esattamente le sezioni fornite.`;

    const userPrompt = `
    JOB DESCRIPTION:
    ${jobDescription}

    CV BASE (JSON):
    ${JSON.stringify(baseData)}

    STRUTTURA JSON RICHIESTA:
    {
      "personalInfo": { "summary": "..." },
      "experience": [ { "id": "...", "description": "...", "highlights": ["..."] } ],
      "skills": [ { "name": "...", "level": "..." } ],
      "keywordsAdded": ["...", "..."],
      "atsScore": 85
    }
    `;

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
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("DeepSeek API Error:", errorData);
      return NextResponse.json(
        { message: "Errore dall'API DeepSeek" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const optimizedContent = JSON.parse(data.choices[0].message.content);

    // Merge optimized content with base data to ensure no loss of info
    const optimizedResume = {
      ...baseData,
      personalInfo: {
        ...baseData.personalInfo,
        summary: optimizedContent.personalInfo.summary,
      },
      experience: baseData.experience.map((exp: any) => {
        const optimizedExp = optimizedContent.experience.find((e: any) => e.id === exp.id);
        return optimizedExp ? { ...exp, description: optimizedExp.description, highlights: optimizedExp.highlights } : exp;
      }),
      skills: optimizedContent.skills,
      keywordsAdded: optimizedContent.keywordsAdded,
      atsScore: optimizedContent.atsScore,
    };

    return NextResponse.json(optimizedResume);
  } catch (error) {
    console.error("Optimization Error:", error);
    return NextResponse.json(
      { message: "Errore interno del server" },
      { status: 500 }
    );
  }
}
