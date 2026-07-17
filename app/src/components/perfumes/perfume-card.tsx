import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CompositionBar } from "@/components/perfumes/composition-bar";
import { FAMILY_LABELS, CONCENTRATION_LABELS } from "@/lib/schemas/perfume";
import { formatBRL, formatPercent } from "@/lib/format";
import type { PerfumeCostResult } from "@/lib/calculations/types";

interface PerfumeCardProps {
  id: string;
  name: string;
  inspiredBrand: string | null;
  family: string;
  concentration: string;
  volumeMl: number;
  cost: PerfumeCostResult;
}

export function PerfumeCard({ id, name, inspiredBrand, family, concentration, volumeMl, cost }: PerfumeCardProps) {
  return (
    <Link href={`/perfumes/${id}`}>
      <Card className="h-full transition hover:border-accent/60 hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-foreground/45">
                {FAMILY_LABELS[family] ?? family}
              </p>
              <h3 className="font-display text-xl leading-tight">{name}</h3>
              {inspiredBrand && (
                <p className="text-sm text-foreground/50">inspirado em {inspiredBrand}</p>
              )}
            </div>
            <span className="shrink-0 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-foreground/60">
              {CONCENTRATION_LABELS[concentration] ?? concentration} · {volumeMl}ml
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-xs text-foreground/45">Custo</p>
              <p className="font-mono text-lg tabular">{formatBRL(cost.totalCost)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-foreground/45">Preço sugerido</p>
              <p className="font-mono text-lg tabular text-accent">{formatBRL(cost.salePrice)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-foreground/45">Margem</p>
              <p className="font-mono text-lg tabular text-sage">{formatPercent(cost.margin)}</p>
            </div>
          </div>
          <CompositionBar
            segments={[
              { label: "Essência", value: cost.essenceCost, colorVar: "--amber" },
              { label: "Hedione", value: cost.hedioneCost, colorVar: "--sage" },
              { label: "Base", value: cost.baseCost, colorVar: "--rosewood" },
              { label: "Frasco", value: cost.bottleCost, colorVar: "--slate" },
            ]}
          />
        </CardContent>
      </Card>
    </Link>
  );
}
