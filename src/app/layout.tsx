import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Resume Tailor - Ottimizza il tuo CV con l'IA",
  description: "Crea versioni ottimizzate del tuo CV per sistemi ATS e recruiter usando l'intelligenza artificiale di DeepSeek.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={`${inter.className} antialiased`}>
        <Navbar />
        <main className="min-h-screen bg-muted/30">
          {children}
        </main>
      </body>
    </html>
  );
}
