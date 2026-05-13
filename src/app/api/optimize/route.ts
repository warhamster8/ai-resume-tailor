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

    const systemPrompt = `ORDINE ASSOLUTO: DEVI SCRIVERE TUTTO IL CV IN LINGUA ${targetLanguage.toUpperCase()}.

Sei un Senior Executive Recruiter. Ottimizza il CV per "${jobTitle}".

REGOLE IMPERATIVE:
1. LINGUA: Ogni singola parola del JSON (summary, position, description, skills) DEVE essere in ${targetLanguage.toUpperCase()}. È vietato usare l'inglese se la lingua scelta è ITALIANO, anche se la Job Description è in inglese.
2. NO CERTIFICAZIONI FALSE: Non inventare PMP, Scrum, ecc.
3. DEDUZIONE SKILLS: Aggiungi skill realistiche e LIVELLI BILANCIATI (non tutti Expert).
4. VIBE-CODING: Includi sempre una skill legata all'uso dell'IA/Vibe-coding se pertinente.
5. REBRANDING TITOLI: Usa la descrizione per decidere il Job Title, ma non copiare pedissequamente il ruolo target.

RISPONDI SOLO CON UN OGGETTO JSON.`;

    const userPrompt = `
    LINGUA OBBLIGATORIA PER QUESTA RISPOSTA: ${targetLanguage.toUpperCase()}
    
    Dati base: ${JSON.stringify(baseData)}
    Esperienze: ${JSON.stringify(experienceWithIndex)}
    Job Description Target: ${jobDescription}
    
    Struttura richiesta (compila tutto in ${targetLanguage.toUpperCase()}):
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
        temperature: 0.2, // Ulteriore riduzione per massima obbedienza
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
    console.error("Optimization Error:", error);
    return NextResponse.json({ message: "Errore durante l'ottimizzazione." }, { status: 500 });
  }
}
