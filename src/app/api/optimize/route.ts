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

REGOLE:
1. NO CERTIFICAZIONI FALSE: Non inventare certificazioni (PMP, Scrum, ecc.).
2. DEDUZIONE SKILLS: Aggiungi skill realistiche dedotte dalle descrizioni (es. Stakeholder Management).
3. REBRANDING TITOLI: Usa la descrizione come fonte di verità per il nuovo Job Title.
4. LINGUA: Tutto in ${targetLanguage}.

RISPONDI ESCLUSIVAMENTE CON UN OGGETTO JSON VALIDO. NO TESTO EXTRA.`;

    const userPrompt = `
    Dati: ${JSON.stringify(baseData)}
    Esperienze: ${JSON.stringify(experienceWithIndex)}
    
    Struttura richiesta:
    {
      "personalInfo": { "summary": "...", "originalSummary": "...", "changeReason": "..." },
      "experience": [
        { "index": 0, "newPosition": "...", "originalPosition": "...", "newDescription": "...", "originalDescription": "...", "changeReason": "..." }
      ],
      "skills": [ { "name": "...", "level": "..." } ],
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

    // Pulizia robusta del JSON (rimuove eventuali backticks markdown)
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
    console.error("Critical Optimization Error:", error);
    return NextResponse.json({ message: "Errore durante l'elaborazione dei dati dell'IA." }, { status: 500 });
  }
}
