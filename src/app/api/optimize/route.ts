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

    const systemPrompt = `MANDATO LINGUISTICO SUPREMO: DEVI SCRIVERE TUTTO ESCLUSIVAMENTE IN LINGUA ${targetLanguage.toUpperCase()}.
NON IMPORTA in che lingua sia scritto l'annuncio di lavoro o i dati originali: la lingua finale deve essere SOLO ${targetLanguage.toUpperCase()}.

Sei un Senior Executive Recruiter esperto in ottimizzazione ATS. Ottimizza il CV per "${jobTitle}".

LOGICA REBRANDING TITOLI (MERCATO INTERNAZIONALE):
1. TRADUZIONE STANDARD: Traduci i titoli interni criptici in ruoli standard di mercato riconosciuti.
2. DIVIETO CLONING: È VIETATO copiare esattamente il titolo dell'annuncio ("${jobTitle}"). Usa sinonimi professionali.
3. COERENZA: Il nuovo titolo deve riflettere le responsabilità reali in lingua ${targetLanguage.toUpperCase()}.

REGOLE CONTENUTO:
- LIVELLI SKILL REALISTICI (Mix di Intermediate, Advanced, Expert).
- Includi sempre "AI-Assisted Development / Vibe-Coding".
- NO CERTIFICAZIONI FALSE.

IMPORTANTE: Ogni campo di testo restituito nel JSON deve essere rigorosamente in ${targetLanguage.toUpperCase()}.`;

    const userPrompt = `
    LINGUA RICHIESTA: ${targetLanguage.toUpperCase()} (Ignora ogni altra lingua presente)
    Job Target: ${jobTitle}
    Job Description (per contesto): ${jobDescription}
    Dati Base CV: ${JSON.stringify(baseData)}
    Esperienze da ottimizzare: ${JSON.stringify(experienceWithIndex)}
    
    STRUTTURA JSON OBBLIGATORIA (TUTTI I CAMPI IN ${targetLanguage.toUpperCase()}):
    {
      "personalInfo": { 
        "summary": "Sommario ottimizzato", 
        "originalSummary": "...", 
        "changeReason": "..." 
      },
      "experience": [
        { 
          "index": 0, 
          "newPosition": "Titolo Standard di Mercato (NO CLONE)", 
          "originalPosition": "...", 
          "newDescription": "Descrizione ottimizzata", 
          "originalDescription": "...", 
          "changeReason": "..." 
        }
      ],
      "skills": [ { "name": "Skill", "level": "Level" } ],
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
        temperature: 0.2, // Ridotta per massima aderenza alle istruzioni linguistiche
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
    console.error("Optimization Error:", error);
    return NextResponse.json({ message: "Errore durante l'ottimizzazione linguistica." }, { status: 500 });
  }
}
