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

    const systemPrompt = `Sei un Senior Executive Recruiter e Career Coach di altissimo livello. 
    LA TUA MISSIONE: Trasformare il CV base dell'utente in una candidatura magnetica per il ruolo di "${jobTitle}".
    
    REGOLE DI OTTIMIZZAZIONE:
    1. JOB TITLES: Analizza i titoli attuali dell'utente. Se sono troppo generici o non riflettono bene il mercato, MODIFICALI per renderli più prestigiosi e allineati al ruolo target (es. "Aiuto cuoco" -> "Commis de Cuisine", "Impiegato" -> "Operations Specialist"). NON inventare, ma usa la terminologia di mercato più corretta.
    2. SOMMARIO: Deve essere un "gancio" irresistibile. Non scrivere frasi fatte. Usa dati e tono professionale senior.
    3. ESPERIENZE: Riformula le descrizioni usando la tecnica STAR (Situation, Task, Action, Result). Enfatizza le responsabilità che sono citate nella Job Description target. Usa verbi d'azione (Gestito, Sviluppato, Coordinato, Ottimizzato).
    4. SKILLS: Aggiorna l'elenco per includere le hard e soft skills richieste dall'annuncio, se coerenti con il profilo dell'utente.
    5. NON INVENTARE FATTI: Puoi cambiare il MODO in cui le cose sono scritte, ma non i fatti (es. se non ha mai usato SAP, non scrivere che lo conosce).`;

    const userPrompt = `
    RUOLO TARGET: ${jobTitle}
    
    DESCRIZIONE DELL'OFFERTA (JD):
    ${jobDescription}

    CV BASE DELL'UTENTE (DA TRASFORMARE):
    ${JSON.stringify(baseData)}

    RISPONDI ESCLUSIVAMENTE IN JSON CON QUESTA STRUTTURA:
    {
      "personalInfo": { "summary": "Sommario ottimizzato e potente" },
      "experience": [ 
        { 
          "id": "id_originale", 
          "position": "Titolo posizione ottimizzato (ES: Senior X invece di X)",
          "description": "Descrizione narrativa ottimizzata",
          "highlights": ["Punto chiave 1", "Punto chiave 2"] 
        } 
      ],
      "skills": [ { "name": "Nome skill", "level": "Livello" } ],
      "keywordsAdded": ["Lista keywords strategiche inserite"],
      "atsScore": 95
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
        temperature: 0.5, // Più alta per favorire la riscrittura incisiva dei contenuti
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ message: "Errore dall'API DeepSeek" }, { status: response.status });
    }

    const data = await response.json();
    const optimizedContent = JSON.parse(data.choices[0].message.content);

    // Merge dell'ottimizzazione con i dati base per non perdere i campi non toccati dall'IA
    const optimizedResume = {
      ...baseData,
      personalInfo: {
        ...baseData.personalInfo,
        summary: optimizedContent.personalInfo.summary,
      },
      experience: baseData.experience.map((exp: any) => {
        const optimizedExp = optimizedContent.experience.find((e: any) => e.id === exp.id);
        if (optimizedExp) {
          return { 
            ...exp, 
            position: optimizedExp.position, // Permettiamo all'IA di migliorare il Job Title
            description: optimizedExp.description, 
            highlights: optimizedExp.highlights 
          };
        }
        return exp;
      }),
      skills: optimizedContent.skills,
      keywordsAdded: optimizedContent.keywordsAdded,
      atsScore: optimizedContent.atsScore,
    };

    return NextResponse.json(optimizedResume);
  } catch (error) {
    console.error("Optimization Error:", error);
    return NextResponse.json({ message: "Errore interno del server" }, { status: 500 });
  }
}
