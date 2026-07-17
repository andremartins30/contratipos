import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getBaseCost } from "@/lib/data/bases";
import { calculateUnitCost } from "@/lib/calculations/ingredientCost";
import { calculatePerfumeCost } from "@/lib/calculations/perfumeCost";
import { CompositionBar } from "@/components/perfumes/composition-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FAMILY_LABELS, CONCENTRATION_LABELS } from "@/lib/schemas/perfume";
import { formatBRL, formatPercent, formatMl } from "@/lib/format";

export default async function PerfumeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const perfume = await prisma.perfume.findUnique({
    where: { id },
    include: { base: true, bottle: true, essenceIngredient: true, hedioneIngredient: true },
  });

  if (!perfume) notFound();

  const baseCost = await getBaseCost(perfume.baseId);
  const essenceCostPerMl = calculateUnitCost({
    purchasePrice: perfume.essenceIngredient.purchasePrice,
    purchaseVolume: perfume.essenceIngredient.purchaseVolume,
  });
  const hedioneCostPerMl = perfume.hedioneIngredient
    ? calculateUnitCost({
        purchasePrice: perfume.hedioneIngredient.purchasePrice,
        purchaseVolume: perfume.hedioneIngredient.purchaseVolume,
      })
    : 0;

  const cost = calculatePerfumeCost({
    volumeMl: perfume.bottle.volumeMl,
    essencePercentage: perfume.essencePercentage,
    essenceCostPerMl,
    hedionePercentage: perfume.hedionePercentage,
    hedioneCostPerMl,
    baseCostPerMl: baseCost.costPerMl,
    bottleCost: perfume.bottle.price,
    marginTarget: perfume.marginTarget,
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/perfumes" className="inline-flex items-center gap-1.5 text-sm text-foreground/55 hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Voltar ao catálogo
      </Link>

      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-foreground/45">
          {FAMILY_LABELS[perfume.family]} · {CONCENTRATION_LABELS[perfume.concentration]}
        </p>
        <h1 className="font-display text-4xl">{perfume.name}</h1>
        {perfume.inspiredBrand && (
          <p className="mt-1 text-sm text-foreground/55">inspirado em {perfume.inspiredBrand}</p>
        )}
        {perfume.description && <p className="mt-3 text-foreground/70">{perfume.description}</p>}
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
          <CardTitle>Ficha técnica</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <Row label="Essência" value={`${perfume.essenceIngredient.name} · ${formatMl(cost.essenceQuantityMl)}`} />
            <Row label="Fixador" value={perfume.hedioneIngredient ? `${perfume.hedioneIngredient.name} · ${formatMl(cost.hedioneQuantityMl)}` : "—"} />
            <Row label="Base" value={`${perfume.base.name} · ${formatMl(cost.baseQuantityMl)}`} />
            <Row label="Frasco" value={formatMl(perfume.bottle.volumeMl)} />
            <Row label="Margem alvo" value={formatPercent(perfume.marginTarget)} />
            <Row label="Status" value={perfume.status} />
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-xs text-foreground/45">{label}</p>
      <p className={`font-mono text-xl tabular ${accent ? "text-accent" : ""}`}>{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-foreground/50">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </>
  );
}
