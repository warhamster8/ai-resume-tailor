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
    const { baseData, jobTitle, jobDescription } = await req.json();

    const systemPrompt = `Sei un Senior Recruiter con oltre 15 anni di esperienza. 
    ADATTAMENTO PERSONA: Analizza il Job Title e la JD:
    - Se la posizione è tecnica/IT, agisci come un Senior Tech Recruiter.
    - Se la posizione è in un altro settore, agisci come un Senior Recruiter esperto di quel settore specifico.
    
    LA TUA MISSIONE:
    - "Indora la pillola": Riformula le esperienze reali dell'utente usando la terminologia più prestigiosa, attuale e adatta al settore, senza mai inventare fatti.
    - ATS & HUMAN: Ottimizza per i software di screening ma mantieni un tono che impressioni un selezionatore umano senior.
    - COERENZA: Assicurati che ogni modifica sia sensata e strategicamente allineata al ruolo target.`;

    const userPrompt = `
    TARGET JOB TITLE: ${jobTitle}
    
    LINKEDIN JOB DESCRIPTION:
    ${jobDescription}

    USER BASE CV (JSON):
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
