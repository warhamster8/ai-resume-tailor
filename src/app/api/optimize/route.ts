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
      startDate: exp.startDate,
      endDate: exp.endDate,
      current: exp.current,
    }));

    const systemPrompt = `Sei un Senior Executive Recruiter specializzato in ottimizzazione CV. 

REGOLA N.1 - DIVIETO CERTIFICAZIONI FALSE:
- NON inventare MAI certificazioni formali (PMP, Scrum Master, certificazioni ISO specifiche, ecc.).

REGOLA N.2 - DEDUZIONE COMPETENZE (LAVORO STRATEGICO):
- Analizza le descrizioni delle esperienze dell'utente. 
- DEDUCI e AGGIUNGI competenze (Hard e Soft Skills) che l'utente possiede realisticamente data la sua attività, ma che non ha elencato.
- Esempio: Se gestiva team e scadenze, aggiungi "Stakeholder Management" o "Resource Planning".
- Queste competenze devono essere estratte o dedotte dai fatti reali e devono essere rilevanti per il ruolo di "${jobTitle}".

REGOLA N.3 - REBRANDING JOB TITLES:
- Usa la descrizione dell'esperienza come fonte di verità. Assegna il titolo di mercato più prestigioso e corretto basandoti su ciò che l'utente ha fatto davvero.

REGOLA N.4 - LINGUA E TONO:
- Scrivi TUTTO in ${targetLanguage}. Usa un tono da Executive, incisivo e orientato ai risultati.`;

    const userPrompt = `RUOLO TARGET: ${jobTitle}
JD TARGET: ${jobDescription}

Dati utente: ${JSON.stringify(baseData)}
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
        temperature: 0.25, // Un po' più di libertà per permettere la deduzione logica
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ message: "Errore API" }, { status: response.status });
    }

    const data = await response.json();
    const optimizedContent = JSON.parse(data.choices[0].message.content);

    const mergedExperience = baseData.experience.map((exp: any, i: number) => {
      const opt = optimizedContent.experience?.find((e: any) => e.index === i)
        ?? optimizedContent.experience?.[i];

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

    const optimizedResume = {
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
      // Qui permettiamo le nuove skill dedotte dall'IA
      skills: optimizedContent.skills || baseData.skills,
      atsScore: optimizedContent.atsScore,
    };

    return NextResponse.json(optimizedResume);
  } catch (error) {
    return NextResponse.json({ message: "Errore interno" }, { status: 500 });
  }
}
