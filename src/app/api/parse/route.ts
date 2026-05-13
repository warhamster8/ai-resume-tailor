import { NextResponse } from "next/server";
import pdf from "pdf-parse";

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
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "Nessun file caricato" },
        { status: 400 }
      );
    }

    // Read file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract text from PDF
    const pdfData = await pdf(buffer);
    const extractedText = pdfData.text;

    const systemPrompt = `Sei un esperto di analisi documenti. 
    Il tuo compito è estrarre TUTTE le informazioni da un CV testuale e organizzarle in un formato JSON strutturato.
    REGOLE:
    1. Sii estremamente preciso con le date (formato YYYY-MM).
    2. Mantieni le descrizioni dei lavori complete.
    3. Identifica correttamente le competenze (skills).
    4. Restituisci ESCLUSIVAMENTE un oggetto JSON valido.`;

    const userPrompt = `
    ESTRAI LE INFORMAZIONI DA QUESTO TESTO DI CV:
    ---
    ${extractedText}
    ---

    STRUTTURA JSON RICHIESTA:
    {
      "personalInfo": {
        "fullName": "...",
        "email": "...",
        "phone": "...",
        "location": "...",
        "summary": "...",
        "linkedin": "...",
        "website": "..."
      },
      "experience": [
        {
          "company": "...",
          "position": "...",
          "startDate": "YYYY-MM",
          "endDate": "YYYY-MM",
          "current": false,
          "description": "..."
        }
      ],
      "education": [
        {
          "school": "...",
          "degree": "...",
          "field": "...",
          "startDate": "YYYY-MM",
          "endDate": "YYYY-MM"
        }
      ],
      "skills": [
        { "name": "...", "level": "Intermediate" }
      ],
      "languages": ["..."]
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
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("DeepSeek API Error:", errorData);
      return NextResponse.json(
        { message: "Errore dall'API DeepSeek" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const parsedResume = JSON.parse(data.choices[0].message.content);

    return NextResponse.json(parsedResume);
  } catch (error) {
    console.error("Parsing Error:", error);
    return NextResponse.json(
      { message: "Errore durante l'estrazione dei dati dal PDF" },
      { status: 500 }
    );
  }
}
