import { NextResponse } from "next/server";
import { ResumeData } from "@/types/resume";

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const API_KEY = process.env.DEEPSEEK_API_KEY;

export async function POST(req: Request) {
  if (!API_KEY) {
    return NextResponse.json({ message: "API Key DeepSeek non configurata" }, { status: 500 });
  }

  try {
    const { baseData, jobTitle, jobDescription } = await req.json();

    const systemPrompt = `Sei un Senior Executive Recruiter. 
    MISSIONE: Ottimizzare il CV per "${jobTitle}".
    
    REGOLE LINGUISTICHE:
    - RILEVA la lingua della Job Description.
    - Se la JD è in INGLESE, scrivi l'intero CV in INGLESE.
    - Se la JD è in ITALIANO, scrivi l'intero CV in ITALIANO.
    - NON mescolare mai le lingue.
    
    REGOLE DI OTTIMIZZAZIONE:
    - Traduci i Job Title in standard di mercato.
    - Riscrivi il sommario e le esperienze per massimizzare l'impatto.
    - Per ogni sezione modificata, devi restituire anche la spiegazione del PERCHÉ hai fatto quella modifica.`;

    const userPrompt = `
    RUOLO TARGET: ${jobTitle}
    JD: ${jobDescription}
    CV BASE: ${JSON.stringify(baseData)}

    RISPONDI IN JSON:
    {
      "personalInfo": { 
        "summary": "Nuovo sommario",
        "originalSummary": "Sommario base",
        "changeReason": "Perché è meglio così"
      },
      "experience": [ 
        { 
          "id": "...", 
          "position": "Nuovo titolo",
          "originalPosition": "Vecchio titolo",
          "description": "Nuova descrizione",
          "originalDescription": "Vecchia descrizione",
          "changeReason": "Spiegazione modifica"
        } 
      ],
      "skills": [ { "name": "...", "level": "..." } ],
      "atsScore": 95
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
        temperature: 0.4,
      }),
    });

    const data = await response.json();
    const optimizedContent = JSON.parse(data.choices[0].message.content);

    // Costruiamo l'oggetto ottimizzato includendo i metadati delle modifiche
    const optimizedResume = {
      ...baseData,
      personalInfo: {
        ...baseData.personalInfo,
        summary: optimizedContent.personalInfo.summary,
        _metadata: {
          original: optimizedContent.personalInfo.originalSummary,
          reason: optimizedContent.personalInfo.changeReason
        }
      },
      experience: baseData.experience.map((exp: any) => {
        const opt = optimizedContent.experience.find((e: any) => e.id === exp.id);
        if (opt) {
          return { 
            ...exp, 
            position: opt.position,
            description: opt.description,
            _metadata: {
              originalPosition: opt.originalPosition,
              originalDescription: opt.originalDescription,
              reason: opt.changeReason
            }
          };
        }
        return exp;
      }),
      skills: optimizedContent.skills,
      atsScore: optimizedContent.atsScore,
    };

    return NextResponse.json(optimizedResume);
  } catch (error) {
    return NextResponse.json({ message: "Errore interno" }, { status: 500 });
  }
}
