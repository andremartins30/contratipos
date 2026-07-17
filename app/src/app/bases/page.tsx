import Link from "next/link";
import { Plus, Beaker, Pencil } from "lucide-react";
import { listBasesWithComposition } from "@/lib/data/bases";
import { calculateBaseCostForVolumes } from "@/lib/calculations/baseCost";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL, formatPercent } from "@/lib/format";
import { DeleteButton } from "@/components/shared/delete-button";
import { deleteBase } from "./actions";

export const dynamic = "force-dynamic";

export default async function BasesPage() {
  const bases = await listBasesWithComposition();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-foreground/45">Fórmulas</p>
          <h1 className="font-display text-3xl">Bases</h1>
        </div>
        <Link href="/bases/novo">
          <Button>
            <Plus className="size-4" />
            Nova base
          </Button>
        </Link>
      </div>

      {bases.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <Beaker className="mx-auto size-8 text-foreground/30" />
          <p className="mt-3 font-display text-lg">Nenhuma base cadastrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {bases.map((base) => {
            const costPerMl = base.items.reduce((sum, item) => sum + item.percentage * item.unitCost, 0);
            const volumes = calculateBaseCostForVolumes(costPerMl);
            return (
              <Card key={base.id}>
                <CardHeader className="flex-row items-start justify-between">
                  <div>
                    <CardTitle>{base.name}</CardTitle>
                    <p className="text-sm text-foreground/50">Lote de referência: {base.batchSize}ml</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link href={`/bases/${base.id}/editar`}>
                      <Button variant="ghost" size="icon" aria-label={`Editar ${base.name}`}>
                        <Pencil className="size-4 text-foreground/70 transition hover:text-accent" />
                      </Button>
                    </Link>
                    <DeleteButton action={deleteBase} id={base.id} label={`Remover ${base.name}?`} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-4 gap-3 text-center text-xs">
                    <Metric label="Custo/ml" value={formatBRL(volumes.perMl)} />
                    <Metric label="30ml" value={formatBRL(volumes.per30ml)} />
                    <Metric label="50ml" value={formatBRL(volumes.per50ml)} />
                    <Metric label="100ml" value={formatBRL(volumes.per100ml)} />
                  </div>
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-border">
                      {base.items.map((item) => (
                        <tr key={item.ingredientId}>
                          <td className="py-1.5 text-foreground/70">{item.ingredientName}</td>
                          <td className="py-1.5 text-right font-mono tabular text-foreground/45">
                            {formatPercent(item.percentage)}
                          </td>
                          <td className="py-1.5 text-right font-mono tabular">
                            {formatBRL(item.percentage * base.batchSize * item.unitCost)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface-muted p-2">
      <p className="text-foreground/45">{label}</p>
      <p className="font-mono tabular text-sm">{value}</p>
    </div>
  );
}
