import Link from "next/link";
import {
  LayoutDashboard,
  FlaskConical,
  FileText,
  Droplets,
  Beaker,
  Truck,
  Wine,
  FileBarChart,
  Settings,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/perfumes", label: "Perfumes", icon: FlaskConical },
  { href: "/projetos", label: "Projetos", icon: FileText },
  { href: "/materias-primas", label: "Matérias-primas", icon: Droplets },
  { href: "/bases", label: "Bases", icon: Beaker },
  { href: "/fornecedores", label: "Fornecedores", icon: Truck },
  { href: "/frascos", label: "Frascos", icon: Wine },
  { href: "/relatorios", label: "Relatórios", icon: FileBarChart },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface px-4 py-6 md:flex">
        <div className="mb-8 px-2">
          <span className="font-display text-2xl tracking-tight">Contratipo</span>
          <p className="mt-0.5 text-xs uppercase tracking-[0.18em] text-foreground/50">
            Ateliê de perfumaria
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground/70 transition hover:bg-surface-muted hover:text-foreground"
            >
              <Icon className="size-4 text-foreground/40 transition group-hover:text-accent" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-between border-t border-border pt-4">
          <span className="text-xs text-foreground/40">v0.1 · MVP</span>
          <ThemeToggle />
        </div>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-4 md:hidden">
          <span className="font-display text-xl">Contratipo</span>
          <ThemeToggle />
        </header>
        <main className="flex-1 px-6 py-8 md:px-10 md:py-10">{children}</main>
      </div>
    </div>
  );
}
