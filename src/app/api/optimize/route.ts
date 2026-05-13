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

    const systemPrompt = `ORDINE ASSOLUTO: SCRIVI TUTTO IN LINGUA ${targetLanguage.toUpperCase()}.

Sei un Senior Executive Recruiter. Ottimizza il CV per "${jobTitle}".

LOGICA REBRANDING TITOLI (LA TUA MISSIONE):
1. TRADUZIONE DAL "LINGUAGGIO INTERNO": I titoli aziendali dell'utente (es. "Digital Application Professional") sono inutili all'esterno. TRADUCILI in termini standard di mercato (es. "Technical Solutions Lead", "IT Systems Architect", "Application Manager").
2. EVITA IL CLONING: NON copiare mai al 100% il titolo dell'annuncio ("${jobTitle}"). Usa sinonimi prestigiosi o ruoli correlati.
3. ESEMPIO DI SUCCESSO: Se l'annuncio cerca un "Technical Project Manager", trasforma il ruolo dell'utente in "Technical Implementation Lead" o "Digital Transformation Coordinator" se la descrizione lo giustifica.
4. COERENZA: Il nuovo titolo deve riflettere le responsabilità reali descritte.

REGOLE COMPETENZE E GENERALI:
- LIVELLI REALISTICI (Mix di Intermediate, Advanced, Expert).
- Includi "AI-Assisted Development / Vibe-Coding" se l'utente usa strumenti moderni.
- NO CERTIFICAZIONI FALSE.
- RISPONDI SOLO CON UN OGGETTO JSON RISPETTANDO LA STRUTTURA RICHIESTA.`;

    const userPrompt = `
    LINGUA: ${targetLanguage.toUpperCase()}
    Job Target: ${jobTitle}
    Dati Base: ${JSON.stringify(baseData)}
    Esperienze: ${JSON.stringify(experienceWithIndex)}
    
    STRUTTURA JSON OBBLIGATORIA DA RESTITUIRE:
    {
      "personalInfo": { 
        "summary": "Sommario riscritto e ottimizzato", 
        "originalSummary": "Copia del summary originale", 
        "changeReason": "Perché lo hai cambiato" 
      },
      "experience": [
        { 
          "index": 0, 
          "newPosition": "TITOLO DI MERCATO (Non clonare il target, non usare l'originale se criptico)", 
          "originalPosition": "Copia originale", 
          "newDescription": "Descrizione riscritta", 
          "originalDescription": "Copia originale", 
          "changeReason": "Spiega la traduzione del titolo" 
        }
      ],
      "skills": [ { "name": "Nome Skill", "level": "Livello (Beginner/Intermediate/Advanced/Expert)" } ],
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
        temperature: 0.3, 
      }),
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);

    const resData = await response.json();
    let rawContent = resData.choices[0].message.content;
    rawContent = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const optimizedContent = JSON.parse(rawContent);

    const mergedExperience = baseData.experience.map((exp: any, i: number) => {
      // Troviamo l'esperienza corrispondente tramite l'indice per massima sicurezza
      const opt = optimizedContent.experience?.find((e: any) => e.index === i) || optimizedContent.experience?.[i];
      if (opt) {
        return {
          ...exp,
          // Assicuriamoci che newPosition esista, altrimenti usiamo l'originale
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
    console.error("Critical Optimization Error:", error);
    return NextResponse.json({ message: "Errore durante l'ottimizzazione." }, { status: 500 });
  }
}
