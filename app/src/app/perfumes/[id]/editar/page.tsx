import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getBaseCost } from "@/lib/data/bases";
import { calculateUnitCost } from "@/lib/calculations/ingredientCost";
import { PerfumeForm } from "@/components/perfumes/perfume-form";

export const dynamic = "force-dynamic";

export default async function EditPerfumePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const perfume = await prisma.perfume.findUnique({
    where: { id },
  });

  if (!perfume || perfume.deletedAt) {
    notFound();
  }

  const [bases, bottles, ingredients] = await Promise.all([
    prisma.base.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.bottle.findMany({ where: { deletedAt: null }, orderBy: { volumeMl: "asc" } }),
    prisma.ingredient.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
  ]);

  const basesWithCost = await Promise.all(
    bases.map(async (base) => ({
      id: base.id,
      name: base.name,
      costPerMl: (await getBaseCost(base.id)).costPerMl,
    }))
  );

  const ingredientOptions = ingredients.map((i) => ({
    id: i.id,
    name: i.name,
    category: i.category,
    unitCost: calculateUnitCost({ purchasePrice: i.purchasePrice, purchaseVolume: i.purchaseVolume }),
  }));

  const initialPerfumeData = {
    id: perfume.id,
    name: perfume.name,
    inspiredBrand: perfume.inspiredBrand,
    family: perfume.family,
    concentration: perfume.concentration,
    description: perfume.description,
    essencePercentage: perfume.essencePercentage,
    essenceIngredientId: perfume.essenceIngredientId,
    hedionePercentage: perfume.hedionePercentage,
    hedioneIngredientId: perfume.hedioneIngredientId,
    baseId: perfume.baseId,
    bottleId: perfume.bottleId,
    quantityProduced: perfume.quantityProduced,
    marginTarget: perfume.marginTarget,
    status: perfume.status,
    notes: perfume.notes,
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href={`/perfumes/${id}`} className="inline-flex items-center gap-1.5 text-sm text-foreground/55 hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Voltar ao perfume
      </Link>
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-foreground/45">Catálogo</p>
        <h1 className="font-display text-3xl">Editar perfume</h1>
        <p className="mt-1 text-sm text-foreground/55">
          Atualize os dados — custo, preço e margem são recalculados automaticamente, em tempo real.
        </p>
      </div>
      <PerfumeForm
        bases={basesWithCost}
        bottles={bottles.map((b) => ({ id: b.id, label: `${b.volumeMl}ml — ${b.model ?? "frasco"}`, volumeMl: b.volumeMl, price: b.price }))}
        ingredients={ingredientOptions}
        initialData={initialPerfumeData}
      />
    </div>
  );
}
