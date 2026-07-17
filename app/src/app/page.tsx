import Link from "next/link";
import { ArrowRight, FlaskConical } from "lucide-react";

export const dynamic = "force-dynamic";
import { listPerfumesWithCost } from "@/lib/data/perfumes";
import { formatBRL, formatPercent } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const items = await listPerfumesWithCost();

  const count = items.length;
  const avgCost = count ? items.reduce((s, i) => s + i.cost.totalCost, 0) / count : 0;
  const avgPrice = count ? items.reduce((s, i) => s + i.cost.salePrice, 0) / count : 0;
  const avgMargin = count ? items.reduce((s, i) => s + i.cost.margin, 0) / count : 0;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-foreground/45">Visão geral</p>
        <h1 className="font-display text-3xl">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Perfumes cadastrados" value={String(count)} />
        <SummaryCard label="Custo médio" value={formatBRL(avgCost)} />
        <SummaryCard label="Preço médio" value={formatBRL(avgPrice)} accent />
        <SummaryCard label="Margem média" value={formatPercent(avgMargin)} />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Catálogo de perfumes</CardTitle>
          <Link href="/perfumes">
            <Button variant="outline" size="sm">
              Ver todos <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {count === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <FlaskConical className="size-8 text-foreground/30" />
              <p className="text-sm text-foreground/55">
                Nenhum perfume cadastrado ainda. Este motor de cálculo já está pronto — falta só o
                primeiro cadastro.
              </p>
              <Link href="/perfumes/novo">
                <Button size="sm">Cadastrar primeiro perfume</Button>
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map(({ perfume, cost }) => (
                <li key={perfume.id} className="flex items-center justify-between py-3 text-sm">
                  <Link href={`/perfumes/${perfume.id}`} className="font-medium hover:text-accent">
                    {perfume.name}
                  </Link>
                  <div className="flex items-center gap-6 font-mono tabular text-foreground/70">
                    <span>{formatBRL(cost.totalCost)}</span>
                    <span className="text-accent">{formatBRL(cost.salePrice)}</span>
                    <span className="text-sage">{formatPercent(cost.margin)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-[0.1em] text-foreground/45">{label}</p>
        <p className={`mt-1 font-mono text-2xl tabular ${accent ? "text-accent" : ""}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
