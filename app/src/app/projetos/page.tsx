import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { listProjectsWithCost } from "@/lib/data/projects";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatBRL, formatPercent } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const items = await listProjectsWithCost();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-foreground/45">Receitas</p>
          <h1 className="font-display text-3xl">Projetos</h1>
          <p className="mt-1 text-sm text-foreground/55">
            Monte uma receita, calcule o custo automaticamente e gere o relatório.
          </p>
        </div>
        <Link href="/projetos/novo">
          <Button>
            <Plus className="size-4" />
            Novo projeto
          </Button>
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <FileText className="mx-auto size-8 text-foreground/30" />
          <p className="mt-3 font-display text-lg">Nenhum projeto criado ainda</p>
          <p className="mt-1 text-sm text-foreground/55">
            Crie um projeto para calcular a receita a partir de uma base cadastrada.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map(({ project, breakdown }) => (
            <Link key={project.id} href={`/projetos/${project.id}`}>
              <Card className="h-full transition hover:border-accent/60 hover:shadow-md">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-foreground/45">{project.base.name}</p>
                      <h3 className="font-display text-lg leading-tight">{project.name}</h3>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                        project.status === "PROMOVIDO"
                          ? "border-sage/40 text-sage"
                          : "border-border text-foreground/55"
                      }`}
                    >
                      {project.status === "PROMOVIDO" ? "Promovido" : "Rascunho"}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between text-sm">
                    <div>
                      <p className="text-xs text-foreground/45">Custo</p>
                      <p className="font-mono tabular">{formatBRL(breakdown.cost.totalCost)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-foreground/45">Preço</p>
                      <p className="font-mono tabular text-accent">{formatBRL(breakdown.cost.salePrice)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-foreground/45">Margem</p>
                      <p className="font-mono tabular text-sage">{formatPercent(breakdown.cost.margin)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
