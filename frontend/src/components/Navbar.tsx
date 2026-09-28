"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Sparkles, 
  BookOpen, 
  Layers, 
  CheckSquare, 
  Gamepad2, 
  Users, 
  Wand2,
  LayoutDashboard,
  FileText,
  FolderArchive
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/perfiles", label: "Perfiles de Aula", icon: Users },
    { href: "/planeaciones", label: "Planeaciones", icon: BookOpen },
    { href: "/actividades", label: "Actividades", icon: Layers },
    { href: "/evaluaciones", label: "Evaluaciones", icon: CheckSquare },
    { href: "/materiales", label: "Fichas & Guías", icon: FileText },
    { href: "/juegos", label: "Mini-Juegos", icon: Gamepad2 },
    { href: "/adaptar", label: "Adaptar para mi aula", icon: Wand2, highlight: true },
    { href: "/biblioteca", label: "Biblioteca", icon: FolderArchive },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-brand-500/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                Aula<span className="text-brand-600">MIA</span>
              </span>
              <p className="text-[11px] text-slate-500 font-medium -mt-0.5">
                La IA que entiende tu aula
              </p>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              if (item.highlight) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`ml-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-brand-500/25 ring-2 ring-brand-400/30"
                        : "bg-brand-50 text-brand-700 hover:bg-brand-100 hover:shadow"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-brand-600 group-hover:rotate-12" />
                    {item.label}
                  </Link>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-slate-100 text-brand-700 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-4 h-4 text-slate-500" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Academic Badge */}
          <div className="hidden lg:flex items-center">
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium border border-slate-200">
              Prototipo Académico DUA
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
