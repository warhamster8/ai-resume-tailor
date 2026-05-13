import { NextResponse } from "next/server";

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const API_KEY = process.env.DEEPSEEK_API_KEY;

export const maxDuration = 60; // Aumenta il timeout a 60 secondi per Vercel

export async function POST(req: Request) {
  if (!API_KEY) {
    return NextResponse.json({ message: "API Key DeepSeek non configurata" }, { status: 500 });
  }

  try {
    const { baseData, jobTitle, jobDescription, targetLanguage, refinement } = await req.json();

    const systemPrompt = `MANDATO LINGUISTICO SUPREMO: SCRIVI ESCLUSIVAMENTE IN ${targetLanguage.toUpperCase()}.
    
    Sei un esperto Senior Recruiter e ATS Optimizer. Ottimizza il CV per il ruolo di "${jobTitle}".
    
    LOGICA REBRANDING:
    - Trasforma i titoli di lavoro in ruoli standard di mercato.
    - NON clonare esattamente "${jobTitle}", usa sinonimi professionali.
    - Includi sempre riferimenti a "AI-Assisted Development" o "Vibe-coding".
    
    FORMATO RISPOSTA: Devi rispondere ESCLUSIVAMENTE con un oggetto JSON valido.`;

    const userPrompt = `
    Lingua: ${targetLanguage.toUpperCase()}
    Job Target: ${jobTitle}
    Job Description: ${jobDescription}
    CV Attuale: ${JSON.stringify(baseData)}
    ${refinement ? `MODIFICA RICHIESTA: ${refinement}` : ""}
    
    Genera un JSON con questa struttura:
    {
      "personalInfo": { "summary": "...", "changeReason": "..." },
      "experience": [
        { "index": 0, "newPosition": "...", "newDescription": "...", "changeReason": "..." }
      ],
      "skills": [ { "name": "...", "level": "..." } ],
      "atsScore": 90
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
        temperature: refinement ? 0.4 : 0.2,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("DeepSeek API Error:", errText);
      throw new Error(`API Error: ${response.status}`);
    }

    const resData = await response.json();
    const rawContent = resData.choices[0].message.content;
    const optimizedContent = JSON.parse(rawContent);

    // Merge robusto delle esperienze
    const mergedExperience = (baseData.experience || []).map((exp: any, i: number) => {
      const opt = optimizedContent.experience?.find((e: any) => e.index === i) || optimizedContent.experience?.[i];
      if (opt) {
        return {
          ...exp,
          position: opt.newPosition || exp.position,
          description: opt.newDescription || exp.description,
          _metadata: {
            originalPosition: exp.position,
            originalDescription: exp.description,
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
          original: baseData.personalInfo.summary,
          reason: optimizedContent.personalInfo?.changeReason || "",
        },
      },
      experience: mergedExperience,
      skills: optimizedContent.skills || baseData.skills,
      atsScore: optimizedContent.atsScore || 70,
    });

  } catch (error: any) {
    console.error("Optimize Route Error:", error);
    return NextResponse.json({ 
      message: "Errore durante l'ottimizzazione.",
      details: error.message 
    }, { status: 500 });
  }
}
