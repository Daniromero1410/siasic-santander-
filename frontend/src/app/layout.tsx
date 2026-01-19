// ═══════════════════════════════════════════════════════════════════════════
// SIASIC-Santander - Layout Principal
// ═══════════════════════════════════════════════════════════════════════════

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout";
import { Footer } from "@/components/layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SIASIC-Santander | Sistema de Análisis Sísmico",
  description: "Sistema de Información y Análisis Sísmico de Santander - Monitoreo del Nido Sísmico de Bucaramanga",
  keywords: ["sismología", "Bucaramanga", "Nido Sísmico", "Santander", "Colombia", "terremotos"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}