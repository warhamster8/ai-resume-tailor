import { NextResponse } from "next/server";

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const API_KEY = process.env.DEEPSEEK_API_KEY;

export async function POST(req: Request) {
  if (!API_KEY) {
    return NextResponse.json({ message: "API Key DeepSeek non configurata" }, { status: 500 });
  }

  try {
    const { baseData, jobTitle, jobDescription, targetLanguage, refinement } = await req.json();

    const experienceWithIndex = baseData.experience.map((exp: any, i: number) => ({
      index: i,
      company: exp.company,
      originalPosition: exp.position,
      originalDescription: exp.description,
    }));

    let systemPrompt = `MANDATO LINGUISTICO SUPREMO: DEVI SCRIVERE TUTTO ESCLUSIVAMENTE IN LINGUA ${targetLanguage.toUpperCase()}.

Sei un Senior Executive Recruiter esperto in ottimizzazione ATS. Ottimizza il CV per "${jobTitle}".

LOGICA REBRANDING TITOLI:
1. TRADUZIONE STANDARD: Traduci i titoli interni in ruoli standard di mercato.
2. DIVIETO CLONING: È VIETATO copiare esattamente il titolo dell'annuncio ("${jobTitle}"). Usa sinonimi professionali.
3. VARIAZIONI: Se l'utente chiede raffinamenti, fornisci alternative diverse da quelle precedenti.

REGOLE CONTENUTO:
- LIVELLI SKILL REALISTICI.
- Includi sempre "AI-Assisted Development / Vibe-Coding".
- NO CERTIFICAZIONI FALSE.`;

    if (refinement) {
      systemPrompt += `\n\nRICHIESTA DI RAFFINAMENTO: L'utente ha già una versione ottimizzata ma vuole apportare questa modifica specifica: "${refinement}". Applica questa modifica mantenendo il resto del CV coerente.`;
    }

    const userPrompt = `
    LINGUA RICHIESTA: ${targetLanguage.toUpperCase()}
    Job Target: ${jobTitle}
    Dati Base CV: ${JSON.stringify(baseData)}
    Esperienze da ottimizzare: ${JSON.stringify(experienceWithIndex)}
    ${refinement ? `COMANDO UTENTE: ${refinement}` : ""}
    
    STRUTTURA JSON OBBLIGATORIA:
    {
      "personalInfo": { "summary": "...", "originalSummary": "...", "changeReason": "..." },
      "experience": [
        { "index": 0, "newPosition": "...", "originalPosition": "...", "newDescription": "...", "originalDescription": "...", "changeReason": "..." }
      ],
      "skills": [ { "name": "...", "level": "..." } ],
      "atsScore": 85
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
        temperature: refinement ? 0.4 : 0.2, // Più flessibilità se stiamo chiedendo varianti
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
      skills: optimizedContent.skills?.length > 0 ? optimizedContent.skills : baseData.skills,
      atsScore: optimizedContent.atsScore || 70,
    });

  } catch (error) {
    console.error("Refinement Error:", error);
    return NextResponse.json({ message: "Errore durante il raffinamento." }, { status: 500 });
  }
}
