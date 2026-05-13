import { NextResponse } from "next/server";

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const API_KEY = process.env.DEEPSEEK_API_KEY;

export async function GET() {
  return NextResponse.json({ message: "API Parse is alive and reachable" });
}

export async function POST(req: Request) {
  if (!API_KEY || API_KEY === "your_deepseek_api_key_here") {
    return NextResponse.json(
      { message: "API Key DeepSeek non configurata. Inserisci una chiave valida nelle impostazioni." },
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

    const bytes = await file.arrayBuffer();
    const buffer = new Uint8Array(bytes);

    let extractedText = "";
    try {
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
      
      // Disable worker to avoid protocol/file issues on Vercel
      const loadingTask = pdfjs.getDocument({
        data: buffer,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
        disableWorker: true,
        verbosity: 0
      } as any);
      
      const pdf = await loadingTask.promise;
      let fullText = "";
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        fullText += pageText + "\n";
      }
      
      extractedText = fullText;

      if (!extractedText || extractedText.trim().length === 0) {
        return NextResponse.json(
          { message: "Non è stato possibile estrarre testo dal PDF. Il file potrebbe essere un'immagine o protetto." },
          { status: 422 }
        );
      }
    } catch (parseError: any) {
      console.error("PDF Parsing Error:", parseError);
      return NextResponse.json(
        { 
          message: "Errore durante l'estrazione del testo dal PDF.", 
          details: parseError.message || String(parseError)
        },
        { status: 500 }
      );
    }

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
      const errorData = await response.json().catch(() => ({}));
      console.error("DeepSeek API Error:", errorData);
      return NextResponse.json(
        { message: "Errore dall'API DeepSeek. Verifica il credito o la validità della chiave." },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsedResume = JSON.parse(content);

    return NextResponse.json(parsedResume);
  } catch (error: any) {
    console.error("Global Parsing Error:", error);
    return NextResponse.json(
      { 
        message: "Errore imprevisto durante l'elaborazione del CV.",
        details: error.message || String(error)
      },
      { status: 500 }
    );
  }
}
