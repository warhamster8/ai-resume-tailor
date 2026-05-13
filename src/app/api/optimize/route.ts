import { NextResponse } from "next/server";

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const API_KEY = process.env.DEEPSEEK_API_KEY;

export async function POST(req: Request) {
  if (!API_KEY) {
    return NextResponse.json({ message: "API Key DeepSeek non configurata" }, { status: 500 });
  }

  try {
    const { baseData, jobTitle, jobDescription } = await req.json();

    // Prepariamo l'array experience con indici espliciti per l'IA
    const experienceWithIndex = baseData.experience.map((exp: any, i: number) => ({
      index: i,
      company: exp.company,
      originalPosition: exp.position,
      originalDescription: exp.description,
      startDate: exp.startDate,
      endDate: exp.endDate,
      current: exp.current,
    }));

    const systemPrompt = `Sei un Senior Executive Recruiter. Ottimizza il CV per la posizione di "${jobTitle}".

REGOLA N.1 - VIETATO INVENTARE:
NON aggiungere certificazioni, corsi, tecnologie o competenze non presenti nel CV originale. Puoi SOLO riformulare ciò che già esiste.

REGOLA N.2 - JOB TITLE: OBBLIGATORIO CAMBIARE:
I titoli interni aziendali sono incomprensibili al mercato esterno. DEVI sempre tradurli nel termine standard di settore.
Esempi:
- "IT Digital Application Professional" → "IT Project Manager" (se il ruolo include project management)
- "Workload Coordinator" → "Operations Coordinator"
- "Quality Specialist MO" → "Quality Assurance Manager"
NON lasciare mai un titolo aziendale criptico invariato.

REGOLA N.3 - LINGUA:
Determina la lingua della Job Description. Scrivi TUTTO il CV in quella lingua. Non mescolare mai italiano e inglese.

REGOLA N.4 - RISCRITTURA OBBLIGATORIA:
Ogni descrizione DEVE essere riscritta con verbi d'azione forti e keyword della JD. NON restituire mai la descrizione originale invariata.`;

    const userPrompt = `RUOLO TARGET: ${jobTitle}
JOB DESCRIPTION: ${jobDescription}

ESPERIENZE DA OTTIMIZZARE (in ordine, per indice):
${JSON.stringify(experienceWithIndex, null, 2)}

ISTRUZIONI:
- Restituisci un array "experience" con ESATTAMENTE ${baseData.experience.length} oggetti, nello stesso ordine.
- Per ogni oggetto, includi: index (invariato), newPosition (titolo ottimizzato), newDescription (descrizione riscritta), changeReason.
- NON omettere nessun elemento dell'array.

SOMMARIO BASE: "${baseData.personalInfo.summary}"
SKILLS ESISTENTI: ${baseData.skills.map((s: any) => s.name).join(', ')}

RISPONDI IN JSON:
{
  "personalInfo": {
    "summary": "Sommario completamente riscritto e potente",
    "originalSummary": "Il sommario originale copiato esattamente",
    "changeReason": "Perché questo è meglio"
  },
  "experience": [
    {
      "index": 0,
      "newPosition": "Titolo standard di mercato",
      "originalPosition": "Titolo originale",
      "newDescription": "Descrizione riscritta con verbi d'azione e keyword della JD",
      "originalDescription": "Descrizione originale",
      "changeReason": "Motivazione"
    }
  ],
  "skills": [
    { "name": "Nome skill (SOLO quelle già esistenti nel CV)", "level": "Livello" }
  ],
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
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error("DeepSeek API Error:", err);
      return NextResponse.json({ message: "Errore dall'API DeepSeek" }, { status: response.status });
    }

    const data = await response.json();
    const raw = data.choices[0].message.content;
    console.log("AI raw response:", raw); // Debug log

    const optimizedContent = JSON.parse(raw);

    // MERGE PER INDICE: molto più robusto del match per ID
    const mergedExperience = baseData.experience.map((exp: any, i: number) => {
      // Cerca prima per indice esplicito, poi per posizione nell'array
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
      // Skills: teniamo quelle originali come fallback sicuro
      skills: optimizedContent.skills?.length > 0
        ? optimizedContent.skills
        : baseData.skills,
      atsScore: optimizedContent.atsScore,
    };

    return NextResponse.json(optimizedResume);
  } catch (error) {
    console.error("Optimization Error:", error);
    return NextResponse.json({ message: "Errore interno del server" }, { status: 500 });
  }
}
