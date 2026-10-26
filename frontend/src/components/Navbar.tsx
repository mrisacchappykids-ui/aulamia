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
  FolderArchive,
  LogIn,
  UserPlus,
  LogOut,
  User as UserIcon,
  Building
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, openLoginModal, openRegisterModal } = useAuth();

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

  // Helper for user initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
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
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              if (item.highlight) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`ml-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all ${
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
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-slate-100 text-brand-700 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-slate-500" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Section: Auth & Academic Badge */}
          <div className="flex items-center gap-3">
            {user ? (
              /* User logged in profile widget */
              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  {getInitials(user.name)}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-800 leading-tight">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate max-w-[130px]">
                    {user.institution || "Docente"}
                  </p>
                </div>
                <button
                  onClick={logout}
                  title="Cerrar sesión"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Guest: Login / Register triggers */
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openLoginModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Ingresar</span>
                </button>
                <button
                  type="button"
                  onClick={openRegisterModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-500/20 transition-all hover:shadow"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Registrarse</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
