import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getProjectWithRelations, computeProjectCost } from "@/lib/data/projects";
import { CompositionBar } from "@/components/perfumes/composition-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrintButton } from "@/components/projects/print-button";
import { PromoteButton } from "@/components/projects/promote-button";
import { Button } from "@/components/ui/button";
import { formatBRL, formatPercent, formatMl } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProjectReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProjectWithRelations(id);
  if (!project) notFound();

  const breakdown = computeProjectCost(project);
  const { cost, baseCost } = breakdown;

  const overrideByIngredient = new Map(project.materialCosts.map((m) => [m.ingredientId, m]));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="no-print flex items-center justify-between">
        <Link href="/projetos" className="inline-flex items-center gap-1.5 text-sm text-foreground/55 hover:text-foreground">
          <ArrowLeft className="size-3.5" /> Voltar aos projetos
        </Link>
        <div className="flex items-center gap-2">
          <PrintButton />
          {project.status !== "PROMOVIDO" && (
            <Link href={`/projetos/${project.id}/editar`}>
              <Button variant="outline" size="sm">
                Editar projeto
              </Button>
            </Link>
          )}
          {project.status !== "PROMOVIDO" ? (
            <PromoteButton projectId={project.id} />
          ) : (
            <Link href={`/perfumes/${project.promotedPerfumeId}`}>
              <span className="rounded-full border border-sage/40 px-3 py-1.5 text-xs font-medium text-sage">
                Promovido a perfume →
              </span>
            </Link>
          )}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-foreground/45">
          Relatório de projeto · {project.base.name}
        </p>
        <h1 className="font-display text-4xl">{project.name}</h1>
        <p className="mt-1 text-sm text-foreground/55">
          Gerado em {new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short" }).format(project.createdAt)}
        </p>
        {project.notes && <p className="mt-3 text-foreground/70">{project.notes}</p>}
      </div>

      <Card className="border-accent/40">
        <CardHeader>
          <CardTitle>Precificação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Stat label="Custo total" value={formatBRL(cost.totalCost)} />
            <Stat label="Preço sugerido" value={formatBRL(cost.salePrice)} accent />
            <Stat label="Lucro" value={formatBRL(cost.profit)} />
            <Stat label="Margem" value={formatPercent(cost.margin)} />
            <Stat label="Markup" value={`${cost.markup.toFixed(2)}x`} />
            <Stat label="ROI" value={formatPercent(cost.roi)} />
          </div>
          <CompositionBar
            segments={[
              { label: "Essência", value: cost.essenceCost, colorVar: "--amber" },
              { label: "Fixador", value: cost.hedioneCost, colorVar: "--sage" },
              { label: "Base", value: cost.baseCost, colorVar: "--rosewood" },
              { label: "Frasco", value: cost.bottleCost, colorVar: "--slate" },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Receita — quantidades</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-foreground/45">
                <th className="pb-2 font-medium">Componente</th>
                <th className="pb-2 font-medium">Quantidade</th>
                <th className="pb-2 font-medium">Origem do preço</th>
                <th className="pb-2 font-medium text-right">Custo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="py-2">{project.essenceIngredient.name} (essência)</td>
                <td className="py-2 font-mono tabular">{formatMl(cost.essenceQuantityMl)}</td>
                <td className="py-2">
                  <PriceOrigin manual={overrideByIngredient.get(project.essenceIngredientId)?.useSystemPrice === false} />
                </td>
                <td className="py-2 text-right font-mono tabular">{formatBRL(cost.essenceCost)}</td>
              </tr>
              {project.hedioneIngredient && (
                <tr>
                  <td className="py-2">{project.hedioneIngredient.name} (fixador)</td>
                  <td className="py-2 font-mono tabular">{formatMl(cost.hedioneQuantityMl)}</td>
                  <td className="py-2">
                    <PriceOrigin
                      manual={overrideByIngredient.get(project.hedioneIngredientId ?? "")?.useSystemPrice === false}
                    />
                  </td>
                  <td className="py-2 text-right font-mono tabular">{formatBRL(cost.hedioneCost)}</td>
                </tr>
              )}
              <tr>
                <td className="py-2">{project.base.name}</td>
                <td className="py-2 font-mono tabular">{formatMl(cost.baseQuantityMl)}</td>
                <td className="py-2 text-xs text-foreground/45">— (ver abaixo)</td>
                <td className="py-2 text-right font-mono tabular">{formatBRL(cost.baseCost)}</td>
              </tr>
              {project.bottle && (
                <tr>
                  <td className="py-2">Frasco {formatMl(project.bottle.volumeMl)}</td>
                  <td className="py-2 font-mono tabular">1 un.</td>
                  <td className="py-2" />
                  <td className="py-2 text-right font-mono tabular">{formatBRL(cost.bottleCost)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Composição da {project.base.name}</CardTitle>
          <p className="text-sm text-foreground/50">
            Custo por ml da base: {formatBRL(breakdown.baseCostPerMl)} · origem do preço de cada material abaixo.
          </p>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-foreground/45">
                <th className="pb-2 font-medium">Material</th>
                <th className="pb-2 font-medium">%</th>
                <th className="pb-2 font-medium">Origem do preço</th>
                <th className="pb-2 font-medium text-right">Custo (lote)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {project.base.items.map((item) => {
                const override = overrideByIngredient.get(item.ingredientId);
                const itemCost = baseCost.byIngredient.find((b) => b.ingredientId === item.ingredientId);
                const manual = override && !override.useSystemPrice;
                return (
                  <tr key={item.ingredientId}>
                    <td className="py-2">{item.ingredient.name}</td>
                    <td className="py-2 font-mono tabular">{formatPercent(item.percentage)}</td>
                    <td className="py-2">
                      <PriceOrigin manual={Boolean(manual)} />
                    </td>
                    <td className="py-2 text-right font-mono tabular">{formatBRL(itemCost?.cost ?? 0)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function PriceOrigin({ manual }: { manual: boolean }) {
  return <span className={manual ? "text-rosewood" : "text-sage"}>{manual ? "Manual" : "Sistema"}</span>;
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-xs text-foreground/45">{label}</p>
      <p className={`font-mono text-xl tabular ${accent ? "text-accent" : ""}`}>{value}</p>
    </div>
  );
}
