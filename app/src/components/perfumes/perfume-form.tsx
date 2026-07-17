"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createPerfume, updatePerfume } from "@/app/perfumes/actions";
import { calculatePerfumeCost } from "@/lib/calculations/perfumeCost";
import { CompositionBar } from "@/components/perfumes/composition-bar";
import { FAMILY_LABELS, CONCENTRATION_LABELS } from "@/lib/schemas/perfume";
import { formatBRL, formatPercent } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Option {
  id: string;
  name: string;
  category: string;
  unitCost: number;
}

interface BottleOption {
  id: string;
  label: string;
  volumeMl: number;
  price: number;
}

interface BaseOption {
  id: string;
  name: string;
  costPerMl: number;
}

const clientSchema = z.object({
  name: z.string().min(2, "Informe o nome do perfume"),
  inspiredBrand: z.string().optional(),
  family: z.string().min(1),
  concentration: z.string().min(1),
  description: z.string().optional(),
  essencePercentage: z.coerce.number().min(1, "Mínimo 1%").max(60, "Máximo 60%"),
  essenceIngredientId: z.string().min(1, "Selecione a essência"),
  hedionePercentage: z.coerce.number().min(0).max(10),
  hedioneIngredientId: z.string().optional(),
  baseId: z.string().min(1, "Selecione uma base"),
  bottleId: z.string().min(1, "Selecione um frasco"),
  quantityProduced: z.coerce.number().int().min(1),
  marginTarget: z.coerce.number().min(0).max(95),
  notes: z.string().optional(),
  status: z.string().default("ATIVO"),
});

type ClientFormInput = z.input<typeof clientSchema>;
type ClientFormValues = z.output<typeof clientSchema>;

export interface PerfumeInitialData {
  id: string;
  name: string;
  inspiredBrand?: string | null;
  family: string;
  concentration: string;
  description?: string | null;
  essencePercentage: number;
  essenceIngredientId: string;
  hedionePercentage: number;
  hedioneIngredientId?: string | null;
  baseId: string;
  bottleId: string;
  quantityProduced: number;
  marginTarget: number;
  status: string;
  notes?: string | null;
}

export function PerfumeForm({
  bases,
  bottles,
  ingredients,
  initialData,
}: {
  bases: BaseOption[];
  bottles: BottleOption[];
  ingredients: Option[];
  initialData?: PerfumeInitialData;
}) {
  const defaultEssence = ingredients.find((i) => i.category === "ESSENCIA") ?? ingredients[0];

  const {
    register,
    watch,
    formState: { errors },
  } = useForm<ClientFormInput, unknown, ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      inspiredBrand: initialData?.inspiredBrand ?? "",
      family: initialData?.family ?? "CITRICO",
      concentration: initialData?.concentration ?? "EDP",
      description: initialData?.description ?? "",
      essencePercentage: initialData ? initialData.essencePercentage * 100 : 20,
      essenceIngredientId: initialData?.essenceIngredientId ?? defaultEssence?.id ?? "",
      hedionePercentage: initialData ? initialData.hedionePercentage * 100 : 0,
      hedioneIngredientId: initialData?.hedioneIngredientId ?? "",
      baseId: initialData?.baseId ?? bases[0]?.id ?? "",
      bottleId: initialData?.bottleId ?? bottles[0]?.id ?? "",
      quantityProduced: initialData?.quantityProduced ?? 1,
      marginTarget: initialData ? initialData.marginTarget * 100 : 65,
      notes: initialData?.notes ?? "",
      status: initialData?.status ?? "ATIVO",
    },
  });

  const values = watch();
  const actionToUse = initialData ? updatePerfume.bind(null, initialData.id) : createPerfume;

  const cost = useMemo(() => {
    const base = bases.find((b) => b.id === values.baseId);
    const bottle = bottles.find((b) => b.id === values.bottleId);
    const essence = ingredients.find((i) => i.id === values.essenceIngredientId);
    const hedione = ingredients.find((i) => i.id === values.hedioneIngredientId);

    if (!base || !bottle || !essence) return null;

    return calculatePerfumeCost({
      volumeMl: bottle.volumeMl,
      essencePercentage: (Number(values.essencePercentage) || 0) / 100,
      essenceCostPerMl: essence.unitCost,
      hedionePercentage: (Number(values.hedionePercentage) || 0) / 100,
      hedioneCostPerMl: hedione?.unitCost ?? 0,
      baseCostPerMl: base.costPerMl,
      bottleCost: bottle.price,
      marginTarget: (Number(values.marginTarget) || 0) / 100,
    });
  }, [values, bases, bottles, ingredients]);

  return (
    <form action={actionToUse} className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>Identificação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nome do perfume</Label>
              <Input id="name" {...register("name")} placeholder="Ex: Noite de Âmbar" />
              {errors.name && <p className="text-xs text-rosewood">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inspiredBrand">Marca inspirada</Label>
              <Input id="inspiredBrand" {...register("inspiredBrand")} placeholder="Opcional" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="family">Família olfativa</Label>
                <Select id="family" {...register("family")}>
                  {Object.entries(FAMILY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="concentration">Concentração</Label>
                <Select id="concentration" {...register("concentration")}>
                  {Object.entries(CONCENTRATION_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Descrição</Label>
              <Input id="description" {...register("description")} placeholder="Notas de topo, coração e fundo..." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fórmula</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produção e margem</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="quantityProduced">Quantidade produzida</Label>
              <Input id="quantityProduced" type="number" {...register("quantityProduced")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="marginTarget">Margem desejada (%)</Label>
              <Input id="marginTarget" type="number" step="0.1" {...register("marginTarget")} />
            </div>
            {initialData && (
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <Select id="status" {...register("status")}>
                  <option value="ATIVO">Ativo</option>
                  <option value="INATIVO">Inativo</option>
                </Select>
              </div>
            )}
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="notes">Observações</Label>
              <Input id="notes" {...register("notes")} placeholder="Opcional" />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full">
          Salvar perfume
        </Button>
      </div>

      <div className="lg:sticky lg:top-8 lg:self-start">
        <Card className="border-accent/40">
          <CardHeader>
            <CardTitle>Precificação em tempo real</CardTitle>
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
                  <Row label="Qtd. essência" value={`${cost.essenceQuantityMl.toFixed(2)}ml`} />
                  <Row label="Qtd. fixador" value={`${cost.hedioneQuantityMl.toFixed(2)}ml`} />
                  <Row label="Qtd. base" value={`${cost.baseQuantityMl.toFixed(2)}ml`} />
                </dl>
              </>
            ) : (
              <p className="text-sm text-foreground/50">
                Selecione base, frasco e essência para ver o cálculo.
              </p>
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
