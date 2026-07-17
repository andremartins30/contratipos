"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { createBase, updateBase } from "@/app/bases/actions";
import { calculateBaseCost, calculateBaseCostForVolumes } from "@/lib/calculations/baseCost";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

interface IngredientOption {
  id: string;
  name: string;
  unitCost: number;
}

interface Row {
  key: string;
  ingredientId: string;
  percentage: number; // pontos percentuais, 0-100
}

export function BaseForm({
  ingredients,
  initialData,
}: {
  ingredients: IngredientOption[];
  initialData?: {
    id: string;
    name: string;
    batchSize: number;
    notes?: string | null;
    items: { ingredientId: string; percentage: number }[];
  };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(initialData?.name ?? "");
  const [batchSize, setBatchSize] = useState(initialData?.batchSize ?? 1000);
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const [rows, setRows] = useState<Row[]>(() => {
    if (initialData?.items && initialData.items.length > 0) {
      return initialData.items.map((item) => ({
        key: crypto.randomUUID(),
        ingredientId: item.ingredientId,
        percentage: item.percentage * 100,
      }));
    }
    return [{ key: crypto.randomUUID(), ingredientId: ingredients[0]?.id ?? "", percentage: 100 }];
  });

  const ingredientById = useMemo(() => new Map(ingredients.map((i) => [i.id, i])), [ingredients]);

  const totalPercentage = rows.reduce((sum, r) => sum + (Number(r.percentage) || 0), 0);

  const cost = useMemo(() => {
    const composition = rows
      .filter((r) => r.ingredientId)
      .map((r) => ({
        ingredientId: r.ingredientId,
        percentage: (Number(r.percentage) || 0) / 100,
        unitCost: ingredientById.get(r.ingredientId)?.unitCost ?? 0,
      }));
    if (composition.length === 0) return null;
    return calculateBaseCost(composition, batchSize);
  }, [rows, batchSize, ingredientById]);

  function addRow() {
    const used = new Set(rows.map((r) => r.ingredientId));
    const next = ingredients.find((i) => !used.has(i.id)) ?? ingredients[0];
    setRows((prev) => [...prev, { key: crypto.randomUUID(), ingredientId: next?.id ?? "", percentage: 0 }]);
  }

  function removeRow(key: string) {
    setRows((prev) => prev.filter((r) => r.key !== key));
  }

  function updateRow(key: string, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function onSubmit() {
    setError(null);
    if (!name.trim()) {
      setError("Informe o nome da base.");
      return;
    }
    if (rows.some((r) => !r.ingredientId)) {
      setError("Selecione um ingrediente em todas as linhas.");
      return;
    }

    startTransition(async () => {
      try {
        if (initialData) {
          await updateBase(initialData.id, {
            name,
            batchSize,
            notes: notes || undefined,
            items: rows.map((r) => ({ ingredientId: r.ingredientId, percentage: (Number(r.percentage) || 0) / 100 })),
          });
        } else {
          await createBase({
            name,
            batchSize,
            notes: notes || undefined,
            items: rows.map((r) => ({ ingredientId: r.ingredientId, percentage: (Number(r.percentage) || 0) / 100 })),
          });
        }
        router.push("/bases");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não foi possível salvar a base.");
      }
    });
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>Dados gerais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="base-name">Nome da base</Label>
              <Input id="base-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Base Turbo" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="base-batch">Lote de referência (ml)</Label>
              <Input
                id="base-batch"
                type="number"
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value) || 0)}
                className="max-w-[160px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="base-notes">Observações</Label>
              <Input id="base-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Opcional" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Composição</CardTitle>
            <span className={cn("font-mono text-sm tabular", Math.abs(totalPercentage - 100) > 0.01 ? "text-rosewood" : "text-sage")}>
              {totalPercentage.toFixed(2)}% do lote
            </span>
          </CardHeader>
          <CardContent className="space-y-3">
            {rows.map((row) => (
              <div key={row.key} className="flex items-center gap-3">
                <Select
                  value={row.ingredientId}
                  onChange={(e) => updateRow(row.key, { ingredientId: e.target.value })}
                  className="flex-1"
                >
                  {ingredients.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  ))}
                </Select>
                <Input
                  type="number"
                  step="0.01"
                  value={row.percentage}
                  onChange={(e) => updateRow(row.key, { percentage: Number(e.target.value) || 0 })}
                  className="w-24"
                />
                <span className="text-xs text-foreground/45">%</span>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeRow(row.key)}>
                  <Trash2 className="size-4 text-rosewood" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addRow}>
              <Plus className="size-3.5" />
              Adicionar ingrediente
            </Button>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-rosewood">{error}</p>}

        <Button size="lg" className="w-full" disabled={isPending} onClick={onSubmit}>
          {isPending ? "Salvando..." : "Salvar base"}
        </Button>
      </div>

      <div className="lg:sticky lg:top-8 lg:self-start">
        <Card className="border-accent/40">
          <CardHeader>
            <CardTitle>Custo calculado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cost ? (
              <>
                <div className="grid grid-cols-2 gap-3 text-center text-sm">
                  {Object.entries(calculateBaseCostForVolumes(cost.costPerMl)).map(([key, value]) => (
                    <div key={key} className="rounded-lg bg-surface-muted p-3">
                      <p className="text-xs text-foreground/45">{VOLUME_LABELS[key] ?? key}</p>
                      <p className="font-mono tabular">{formatBRL(value)}</p>
                    </div>
                  ))}
                </div>
                <dl className="space-y-1.5 border-t border-border pt-4 text-sm">
                  {rows.map((r) => {
                    const ing = ingredientById.get(r.ingredientId);
                    if (!ing) return null;
                    return (
                      <div key={r.key} className="flex justify-between">
                        <dt className="text-foreground/60">
                          {ing.name} <span className="text-foreground/35">· {formatPercent(r.percentage / 100)}</span>
                        </dt>
                        <dd className="font-mono tabular">
                          {formatBRL(((Number(r.percentage) || 0) / 100) * batchSize * ing.unitCost)}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </>
            ) : (
              <p className="text-sm text-foreground/50">Adicione ao menos um ingrediente.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const VOLUME_LABELS: Record<string, string> = {
  perMl: "Por ml",
  perLiter: "Por litro",
  per30ml: "Por 30ml",
  per50ml: "Por 50ml",
  per100ml: "Por 100ml",
};
