import { NextResponse } from "next/server";

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const API_KEY = process.env.DEEPSEEK_API_KEY;

export const maxDuration = 60;

async function callDeepSeekWithRetry(payload: any, retries = 2): Promise<any> {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) return await response.json();
      
      const errText = await response.text();
      console.warn(`DeepSeek Attempt ${i + 1} failed:`, errText);
      
      if (i === retries) throw new Error(`DeepSeek API error: ${response.status}`);
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    } catch (error) {
      if (i === retries) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

export async function POST(req: Request) {
  if (!API_KEY) {
    return NextResponse.json({ message: "API Key DeepSeek non configurata" }, { status: 500 });
  }

  try {
    const { baseData, jobTitle, jobDescription, targetLanguage, refinement } = await req.json();

    const systemPrompt = `Sei un esperto Senior Recruiter e ATS Optimizer. 
    LINGUA RICHIESTA: ${targetLanguage.toUpperCase()}.
    
    OBIETTIVO: Ottimizza il CV per il ruolo "${jobTitle}".
    
    REGOLE DI REBRANDING:
    - Trasforma i titoli di lavoro in ruoli standard e moderni.
    - Usa parole chiave ATS pertinenti alla Job Description fornita.
    - Mantieni un tono professionale ed energico.
    - Includi riferimenti a metodologie moderne (es. AI-assisted dev, Agile, ecc.) se pertinenti.
    
    REQUISITO TECNICO: Rispondi ESCLUSIVAMENTE con un JSON puro, senza commenti o markdown.`;

    const userPrompt = `
    Job Description: ${jobDescription}
    CV Attuale: ${JSON.stringify(baseData)}
    ${refinement ? `RAFFINAMENTO SPECIFICO: ${refinement}` : "OTTIMIZZAZIONE GENERALE ATS"}
    
    Genera un JSON con questa struttura esatta:
    {
      "personalInfo": { "summary": "...", "changeReason": "..." },
      "experience": [
        { "index": 0, "newPosition": "...", "newDescription": "...", "changeReason": "..." }
      ],
      "skills": [ { "name": "...", "level": "..." } ],
      "atsScore": 85
    }`;

    const resData = await callDeepSeekWithRetry({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: refinement ? 0.4 : 0.2,
      max_tokens: 2000
    });

    const rawContent = resData.choices[0].message.content;
    let optimizedContent;
    try {
      optimizedContent = JSON.parse(rawContent);
    } catch (e) {
      console.error("JSON Parse Error:", rawContent);
      throw new Error("L'IA ha restituito un formato non valido. Riprova.");
    }

    // Merge intelligente
    const mergedExperience = (baseData.experience || []).map((exp: any, i: number) => {
      const opt = optimizedContent.experience?.find((e: any) => e.index === i) || optimizedContent.experience?.[i];
      if (opt && (opt.newPosition || opt.newDescription)) {
        return {
          ...exp,
          position: opt.newPosition || exp.position,
          description: opt.newDescription || exp.description,
          _metadata: {
            originalPosition: exp.position,
            originalDescription: exp.description,
            reason: opt.changeReason || "Ottimizzazione ATS",
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
          reason: optimizedContent.personalInfo?.changeReason || "Ottimizzazione del profilo",
        },
      },
      experience: mergedExperience,
      skills: Array.isArray(optimizedContent.skills) ? optimizedContent.skills : baseData.skills,
      atsScore: optimizedContent.atsScore || 75,
    });

  } catch (error: any) {
    console.error("Optimize Route Error:", error);
    return NextResponse.json({ 
      message: "L'IA è temporaneamente sovraccarica o ha riscontrato un errore.",
      details: error.message 
    }, { status: 500 });
  }
}
