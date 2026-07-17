"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createProject } from "@/app/projetos/actions";
import { calculatePerfumeCost } from "@/lib/calculations/perfumeCost";
import { calculateBaseCost } from "@/lib/calculations/baseCost";
import { CompositionBar } from "@/components/perfumes/composition-bar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL, formatPercent, formatMl } from "@/lib/format";
import { cn } from "@/lib/utils";

interface IngredientOption {
  id: string;
  name: string;
  category: string;
  unitCost: number;
}

interface BaseOption {
  id: string;
  name: string;
  batchSize: number;
  items: { ingredientId: string; ingredientName: string; percentage: number; unitCost: number }[];
}

interface BottleOption {
  id: string;
  label: string;
  volumeMl: number;
  price: number;
}

const clientSchema = z.object({
  name: z.string().min(2, "Informe o nome do projeto"),
  essencePercentage: z.coerce.number().min(1, "Mínimo 1%").max(60, "Máximo 60%"),
  essenceIngredientId: z.string().min(1, "Selecione a essência"),
  hedionePercentage: z.coerce.number().min(0).max(10),
  hedioneIngredientId: z.string().optional(),
  baseId: z.string().min(1, "Selecione uma base"),
  bottleId: z.string().min(1, "Selecione um frasco"),
  marginTarget: z.coerce.number().min(0).max(95),
  notes: z.string().optional(),
});

type ClientFormInput = z.input<typeof clientSchema>;
type ClientFormValues = z.output<typeof clientSchema>;

interface MaterialRow {
  ingredientId: string;
  name: string;
  role: string;
  percentage?: number;
  systemUnitCost: number;
}

interface OverrideState {
  useSystemPrice: boolean;
  manualUnitCost: number;
}

export function ProjectForm({
  bases,
  bottles,
  ingredients,
}: {
  bases: BaseOption[];
  bottles: BottleOption[];
  ingredients: IngredientOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<Record<string, OverrideState>>({});

  const defaultEssence = ingredients.find((i) => i.category === "ESSENCIA") ?? ingredients[0];

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormInput, unknown, ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      essencePercentage: 20,
      hedionePercentage: 0,
      baseId: bases[0]?.id ?? "",
      bottleId: bottles[0]?.id ?? "",
      essenceIngredientId: defaultEssence?.id ?? "",
      marginTarget: 65,
    },
  });

  const values = watch();
  const ingredientById = useMemo(() => new Map(ingredients.map((i) => [i.id, i])), [ingredients]);
  const selectedBase = bases.find((b) => b.id === values.baseId);

  const materialRows = useMemo<MaterialRow[]>(() => {
    const rows: MaterialRow[] = [];
    const seen = new Set<string>();

    if (values.essenceIngredientId) {
      const ing = ingredientById.get(values.essenceIngredientId);
      if (ing) {
        rows.push({ ingredientId: ing.id, name: ing.name, role: "Essência", systemUnitCost: ing.unitCost });
        seen.add(ing.id);
      }
    }
    if (values.hedioneIngredientId) {
      const ing = ingredientById.get(values.hedioneIngredientId);
      if (ing && !seen.has(ing.id)) {
        rows.push({ ingredientId: ing.id, name: ing.name, role: "Fixador", systemUnitCost: ing.unitCost });
        seen.add(ing.id);
      }
    }
    if (selectedBase) {
      for (const item of selectedBase.items) {
        if (seen.has(item.ingredientId)) continue;
        rows.push({
          ingredientId: item.ingredientId,
          name: item.ingredientName,
          role: "Base",
          percentage: item.percentage,
          systemUnitCost: item.unitCost,
        });
        seen.add(item.ingredientId);
      }
    }
    return rows;
  }, [values.essenceIngredientId, values.hedioneIngredientId, selectedBase, ingredientById]);

  // Garante que toda linha de material tenha um override inicializado (preço do sistema por padrão),
  // sem apagar ajustes manuais já feitos pelo usuário quando a lista muda.
  useEffect(() => {
    setOverrides((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const row of materialRows) {
        if (!next[row.ingredientId]) {
          next[row.ingredientId] = { useSystemPrice: true, manualUnitCost: row.systemUnitCost };
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [materialRows]);

  function resolvedUnitCost(row: MaterialRow) {
    const override = overrides[row.ingredientId];
    if (override && !override.useSystemPrice) return override.manualUnitCost;
    return row.systemUnitCost;
  }

  const cost = useMemo(() => {
    if (!selectedBase) return null;
    const bottle = bottles.find((b) => b.id === values.bottleId);
    const essence = ingredientById.get(values.essenceIngredientId);
    if (!bottle || !essence) return null;

    const baseComposition = selectedBase.items.map((item) => {
      const row = materialRows.find((r) => r.ingredientId === item.ingredientId && r.role === "Base");
      return {
        ingredientId: item.ingredientId,
        percentage: item.percentage,
        unitCost: row ? resolvedUnitCost(row) : item.unitCost,
      };
    });
    const baseCost = calculateBaseCost(baseComposition, selectedBase.batchSize);

    const essenceRow = materialRows.find((r) => r.role === "Essência");
    const hedioneRow = materialRows.find((r) => r.role === "Fixador");

    return calculatePerfumeCost({
      volumeMl: bottle.volumeMl,
      essencePercentage: (Number(values.essencePercentage) || 0) / 100,
      essenceCostPerMl: essenceRow ? resolvedUnitCost(essenceRow) : essence.unitCost,
      hedionePercentage: (Number(values.hedionePercentage) || 0) / 100,
      hedioneCostPerMl: hedioneRow ? resolvedUnitCost(hedioneRow) : 0,
      baseCostPerMl: baseCost.costPerMl,
      bottleCost: bottle.price,
      marginTarget: (Number(values.marginTarget) || 0) / 100,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, selectedBase, bottles, ingredientById, materialRows, overrides]);

  function onSubmit(form: ClientFormValues) {
    setSubmitError(null);
    const materials = materialRows.map((row) => {
      const o = overrides[row.ingredientId] ?? { useSystemPrice: true, manualUnitCost: row.systemUnitCost };
      return {
        ingredientId: row.ingredientId,
        useSystemPrice: o.useSystemPrice,
        manualUnitCost: o.useSystemPrice ? undefined : o.manualUnitCost,
      };
    });

    startTransition(async () => {
      try {
        const { id } = await createProject({
          name: form.name,
          essencePercentage: form.essencePercentage / 100,
          essenceIngredientId: form.essenceIngredientId,
          hedionePercentage: form.hedionePercentage / 100,
          hedioneIngredientId: form.hedioneIngredientId || undefined,
          baseId: form.baseId,
          bottleId: form.bottleId,
          marginTarget: form.marginTarget / 100,
          notes: form.notes || undefined,
          materials,
        });
        router.push(`/projetos/${id}`);
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : "Não foi possível salvar o projeto.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>Projeto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nome do perfume</Label>
              <Input id="name" {...register("name")} placeholder="Ex: Noite de Âmbar" />
              {errors.name && <p className="text-xs text-rosewood">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="baseId">Base</Label>
                <Select id="baseId" {...register("baseId")}>
                  {bases.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bottleId">Frasco</Label>
                <Select id="bottleId" {...register("bottleId")}>
                  {bottles.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="essenceIngredientId">Essência</Label>
                <Select id="essenceIngredientId" {...register("essenceIngredientId")}>
                  {ingredients.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="essencePercentage">Essência (%)</Label>
                <Input id="essencePercentage" type="number" step="0.1" {...register("essencePercentage")} />
                {errors.essencePercentage && (
                  <p className="text-xs text-rosewood">{errors.essencePercentage.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="hedioneIngredientId">Fixador (opcional)</Label>
                <Select id="hedioneIngredientId" {...register("hedioneIngredientId")}>
                  <option value="">Nenhum</option>
                  {ingredients.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hedionePercentage">Fixador (%)</Label>
                <Input id="hedionePercentage" type="number" step="0.01" {...register("hedionePercentage")} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="marginTarget">Margem desejada (%)</Label>
              <Input id="marginTarget" type="number" step="0.1" {...register("marginTarget")} className="max-w-[160px]" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Observações</Label>
              <Input id="notes" {...register("notes")} placeholder="Opcional" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custo dos materiais</CardTitle>
            <p className="text-sm text-foreground/50">
              Marque &ldquo;usar valor do sistema&rdquo; para puxar o preço cadastrado, ou desmarque para simular
              um custo manual, material por material.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {materialRows.map((row) => {
              const override = overrides[row.ingredientId] ?? { useSystemPrice: true, manualUnitCost: row.systemUnitCost };
              return (
                <div
                  key={row.ingredientId}
                  className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3"
                >
                  <div className="min-w-[9rem] flex-1">
                    <p className="text-sm font-medium">{row.name}</p>
                    <p className="text-xs text-foreground/45">
                      {row.role}
                      {row.percentage != null ? ` · ${formatPercent(row.percentage)}` : ""}
                    </p>
                  </div>
                  <label className="flex items-center gap-1.5 text-xs text-foreground/60">
                    <input
                      type="checkbox"
                      checked={override.useSystemPrice}
                      onChange={(e) =>
                        setOverrides((prev) => ({
                          ...prev,
                          [row.ingredientId]: { ...override, useSystemPrice: e.target.checked },
                        }))
                      }
                    />
                    usar valor do sistema
                  </label>
                  <Input
                    type="number"
                    step="0.0001"
                    disabled={override.useSystemPrice}
                    value={override.useSystemPrice ? row.systemUnitCost : override.manualUnitCost}
                    onChange={(e) =>
                      setOverrides((prev) => ({
                        ...prev,
                        [row.ingredientId]: { ...override, manualUnitCost: Number(e.target.value) || 0 },
                      }))
                    }
                    className={cn("w-28", override.useSystemPrice && "opacity-50")}
                  />
                  <span className="text-xs text-foreground/45">R$/ml</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {submitError && <p className="text-sm text-rosewood">{submitError}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={isPending}>
          {isPending ? "Salvando..." : "Calcular e salvar projeto"}
        </Button>
      </div>

      <div className="lg:sticky lg:top-8 lg:self-start">
        <Card className="border-accent/40">
          <CardHeader>
            <CardTitle>Receita calculada</CardTitle>
            <p className="text-sm text-foreground/50">Atualiza sozinha conforme você preenche o formulário.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {cost ? (
              <>
                <div className="grid grid-cols-2 gap-4">
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
                <dl className="space-y-1.5 border-t border-border pt-4 text-sm">
                  <Row label="Qtd. essência" value={formatMl(cost.essenceQuantityMl)} />
                  <Row label="Qtd. fixador" value={formatMl(cost.hedioneQuantityMl)} />
                  <Row label={`Qtd. ${selectedBase?.name ?? "base"}`} value={formatMl(cost.baseQuantityMl)} />
                </dl>
              </>
            ) : (
              <p className="text-sm text-foreground/50">Selecione base, frasco e essência para ver o cálculo.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </form>
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
    <div className="flex justify-between">
      <dt className="text-foreground/50">{label}</dt>
      <dd className="font-mono tabular">{value}</dd>
    </div>
  );
}
