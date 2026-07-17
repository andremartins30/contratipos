import { cn } from "@/lib/utils";

export interface CompositionSegment {
  label: string;
  value: number;
  colorVar: string; // css var name, e.g. "--amber"
}

const formatBRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/**
 * Barra de composição de custo: segmento proporcional ao custo de cada
 * componente do perfume (essência, hedione, base, frasco). É a peça central
 * de leitura visual do sistema — reaparece no card do perfume e no simulador.
 */
export function CompositionBar({
  segments,
  className,
}: {
  segments: CompositionSegment[];
  className?: string;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-surface-muted">
        {segments.map((s) => (
          <div
            key={s.label}
            style={{ width: `${(s.value / total) * 100}%`, backgroundColor: `var(${s.colorVar})` }}
            className="h-full first:rounded-l-full last:rounded-r-full"
            title={`${s.label}: ${formatBRL.format(s.value)}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground/60">
        {segments.map((s) => (
          <span key={s.label} className="inline-flex items-center gap-1.5">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: `var(${s.colorVar})` }}
            />
            {s.label}
            <span className="tabular font-mono text-foreground/80">{formatBRL.format(s.value)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
