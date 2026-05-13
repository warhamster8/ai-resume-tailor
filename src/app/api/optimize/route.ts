import { NextResponse } from "next/server";

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const API_KEY = process.env.DEEPSEEK_API_KEY;

export async function POST(req: Request) {
  if (!API_KEY) {
    return NextResponse.json({ message: "API Key DeepSeek non configurata" }, { status: 500 });
  }

  try {
    const { baseData, jobTitle, jobDescription } = await req.json();

    const systemPrompt = `Sei un Senior Executive Recruiter. Il tuo compito è ottimizzare il CV di un candidato per una specifica posizione.

REGOLA ASSOLUTA N.1 - VIETATO INVENTARE:
NON aggiungere MAI certificazioni, corsi, titoli di studio, tecnologie, lingue o competenze che NON sono già presenti nel CV base. Se lo fai, stai falsificando un documento professionale. Puoi solo riformulare ciò che già esiste.

REGOLA ASSOLUTA N.2 - JOB TITLE OBBLIGATORIO DA MODIFICARE:
I Job Title interni alle aziende spesso non hanno senso per chi legge il CV dall'esterno. Devi SEMPRE trasformarli in titoli standard di mercato, allineati con il ruolo target.
Esempi OBBLIGATORI da seguire:
- "IT Digital Application Professional" → "IT Project Manager" o "Application Manager" (a seconda del target)
- "Workload Coordinator" → "Operations Coordinator" o "Demand Planner"
- "Quality Specialist MO" → "Quality Manager" o "QA Specialist"
- "Business Analyst Jr" → "Business Analyst" (rimuovi Jr se non serve al target)
Il titolo ottimizzato deve essere il termine più universalmente riconosciuto e prestigioso per quel ruolo, coerente con la posizione target.

REGOLA N.3 - LINGUA:
Analizza la lingua della Job Description. Scrivi TUTTO il CV nella stessa lingua (italiano o inglese). Non mescolare mai le due lingue.

REGOLA N.4 - RISCRITTURA ESPERIENZE:
Riscrivi le descrizioni di ogni esperienza usando verbi d'azione (Gestito, Guidato, Implementato, Ottimizzato) e la tecnica STAR. Integra le keyword della JD dove pertinente.`;

    const userPrompt = `RUOLO TARGET: ${jobTitle}

JOB DESCRIPTION:
${jobDescription}

CV BASE (non modificare i FATTI, solo il modo in cui sono espressi):
${JSON.stringify(baseData)}

RISPONDI ESCLUSIVAMENTE IN JSON con questa struttura esatta:
{
  "personalInfo": {
    "summary": "Sommario ottimizzato",
    "originalSummary": "Copia esatta del sommario originale dal CV base",
    "changeReason": "Perché questo sommario è più efficace"
  },
  "experience": [
    {
      "id": "id_originale_invariato",
      "position": "NUOVO TITOLO STANDARD DI MERCATO (OBBLIGATORIO, non copiare quello originale se è aziendale)",
      "originalPosition": "Titolo originale esatto dal CV base",
      "description": "Descrizione riscritta con verbi d'azione e keyword della JD",
      "originalDescription": "Descrizione originale esatta dal CV base",
      "changeReason": "Spiegazione concisa del perché questo titolo/descrizione è migliore"
    }
  ],
  "skills": [
    { "name": "Nome skill (SOLO skill già presenti nel CV base, NESSUNA AGGIUNTA)", "level": "Livello originale" }
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
      return NextResponse.json({ message: "Errore dall'API DeepSeek" }, { status: response.status });
    }

    const data = await response.json();
    const optimizedContent = JSON.parse(data.choices[0].message.content);

    // Merge: usiamo i dati ottimizzati dell'IA ma manteniamo tutti i campi strutturali del CV base
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
        const opt = optimizedContent.experience?.find((e: any) => e.id === exp.id);
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
      // IMPORTANTE: per le skills, filtriamo per assicurarci che siano solo quelle già nel CV base
      skills: optimizedContent.skills?.filter((optSkill: any) =>
        baseData.skills.some((baseSkill: any) =>
          baseSkill.name.toLowerCase().includes(optSkill.name.toLowerCase().substring(0, 5))
        )
      ) || baseData.skills,
      atsScore: optimizedContent.atsScore,
    };

    return NextResponse.json(optimizedResume);
  } catch (error) {
    console.error("Optimization Error:", error);
    return NextResponse.json({ message: "Errore interno del server" }, { status: 500 });
  }
}
