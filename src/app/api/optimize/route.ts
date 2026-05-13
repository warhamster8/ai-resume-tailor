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

    const systemPrompt = `ORDINE SUPREMO: SCRIVI TUTTO IN LINGUA ${targetLanguage.toUpperCase()}.

Sei un Senior Recruiter. Il tuo obiettivo è TRADURRE i titoli interni in TITOLI DI MERCATO STANDARD.

REGOLA N.1 - DIVIETO TITOLI INTERNI:
È SEVERAMENTE VIETATO usare i titoli originali se contengono termini come "Professional", "Specialist" o "Coordinator" in modo generico. 
DEVI trasformarli in titoli che un recruiter cercherebbe su LinkedIn.

ESEMPI OBBLIGATORI DI REBRANDING:
- "IT Digital Application Professional" -> "IT Project Manager" o "Digital Solutions Lead"
- "IT PLM and Quality Specialist" -> "PLM Manager" o "Quality Assurance Lead"
- "Diesel Studies and Workload Coordinator" -> "Engineering Operations Lead" o "Project Demand Planner"
- Qualsiasi titolo "Professional" -> Deve diventare "Manager", "Lead", o "Specialist" (con area specifica).

REGOLA N.2 - LA DESCRIZIONE COMANDA:
Leggi la descrizione per capire il vero livello. Se l'utente gestiva processi complessi e team, usa "Manager" o "Lead", anche se il titolo originale era "Specialist".

REGOLA N.3 - DIVIETO DI COPIA 1:1 (FONDAMENTALE):
È SEVERAMENTE VIETATO che un titolo passato sia IDENTICO al titolo dell'annuncio target ("${jobTitle}"). 
- Se l'annuncio è "Technical Project Manager", usa sinonimi come: "IT Project Lead", "Digital Delivery Manager", "Solutions Implementation Lead", "Senior Technical Specialist".
- Usa varianti che suggeriscano competenza ma mantengano una distinzione formale.
- Un titolo 1:1 è considerato un errore grave e sospetto.

RISPONDI SOLO IN JSON.`;

    const userPrompt = `
    LINGUA: ${targetLanguage.toUpperCase()}
    Ruolo cercato: ${jobTitle}
    
    TRASFORMA QUESTI TITOLI INTERNI IN TITOLI PRESTIGIOSI DI MERCATO:
    ${JSON.stringify(experienceWithIndex, null, 2)}`;

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
        temperature: 0.4, // Aumentata per favorire la "traduzione creativa" dei titoli
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
    return NextResponse.json({ message: "Errore durante l'ottimizzazione." }, { status: 500 });
  }
}
