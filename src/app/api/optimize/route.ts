import { NextResponse } from "next/server";

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const API_KEY = process.env.DEEPSEEK_API_KEY;

export async function POST(req: Request) {
  if (!API_KEY) {
    return NextResponse.json({ message: "API Key DeepSeek non configurata" }, { status: 500 });
  }

  try {
    const { baseData, jobTitle, jobDescription, targetLanguage } = await req.json();

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

    const systemPrompt = `Sei un Senior Executive Recruiter. Il tuo compito è ottimizzare il CV di un candidato per una specifica posizione.

REGOLA CRITICA N.1 - DIVIETO ASSOLUTO DI ALLUCINAZIONI:
- È SEVERAMENTE VIETATO inventare certificazioni (es. PMP, Scrum Master, Prince2, ecc.) se non sono già presenti nel CV originale.
- È SEVERAMENTE VIETATO aggiungere competenze tecniche o software che il candidato non ha menzionato.
- IL TUO COMPITO È MIGLIORARE L'ESPOSIZIONE, NON IL CONTENUTO STORICO.
- Se inventi una certificazione, il tuo output è considerato FALLIMENTARE e PERICOLOSO.

REGOLA N.2 - LINGUA OBBLIGATORIA:
Scrivi l'INTERO CV esclusivamente in lingua ${targetLanguage}.

REGOLA ASSOLUTA N.3 - REBRANDING STRATEGICO DEI TITOLI:
Il nuovo Job Title NON deve essere un semplice copia-incolla del ruolo target. 
DEVI analizzare attentamente la DESCRIZIONE dell'esperienza per capire cosa ha fatto davvero l'utente. 
Esempio: Se il titolo originale è "Specialist" ma la descrizione dice che coordinava un team e gestiva budget, il nuovo titolo deve essere "Team Lead" o "Project Manager". 
Usa la descrizione come fonte di verità per assegnare il titolo di mercato più prestigioso e corretto. 
NON inventare responsabilità, ma dai il giusto nome a quelle esistenti.

REGOLA N.4 - RISCRITTURA ESPERIENZE:
Riformula le esperienze usando verbi d'azione e focalizzandoti sui risultati, MA basandoti SOLO sui fatti forniti.`;

    const userPrompt = `RUOLO TARGET: ${jobTitle}
JOB DESCRIPTION: ${jobDescription}
LINGUA RICHIESTA: ${targetLanguage}

CV ORIGINALE DA NON FALSIFICARE:
${JSON.stringify(baseData, null, 2)}

ESPERIENZE (da mappare per indice):
${JSON.stringify(experienceWithIndex, null, 2)}

ISTRUZIONI JSON:
- Restituisci l'array "experience" con index, newPosition, newDescription, changeReason.
- Restituisci "personalInfo" con summary, originalSummary, changeReason.
- Restituisci "skills" con SOLO le competenze realmente presenti nel CV originale.`;

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
        temperature: 0.1, // Ridotto al minimo per eliminare le invenzioni
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ message: "Errore dall'API DeepSeek" }, { status: response.status });
    }

    const data = await response.json();
    const raw = data.choices[0].message.content;
    const optimizedContent = JSON.parse(raw);

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
      // Filtro extra: assicuriamoci che le skill non siano allucinate
      skills: optimizedContent.skills?.length > 0 ? optimizedContent.skills : baseData.skills,
      atsScore: optimizedContent.atsScore,
    };

    return NextResponse.json(optimizedResume);
  } catch (error) {
    console.error("Optimization Error:", error);
    return NextResponse.json({ message: "Errore interno del server" }, { status: 500 });
  }
}
