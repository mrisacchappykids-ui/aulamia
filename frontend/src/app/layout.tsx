import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "AulaMIA | La IA que entiende tu aula y te ayuda a enseñar",
  description: "Plataforma de asistencia pedagógica contextualizada con IA para diseño de clases, actividades multinivel, evaluaciones, gamificación y adecuaciones de inclusión.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-brand-500 selection:text-white">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 no-print">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="font-semibold text-slate-700">
              AulaMIA • La IA que entiende tu aula y te ayuda a enseñar
            </p>
            <p className="mt-1 text-slate-500">
              Proyecto académico – Técnicas de Inteligencia Artificial para la Educación. Licenciatura en Tecnología.
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Principio Pedagógico: “La IA genera propuestas; el docente decide”.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
