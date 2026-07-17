import { prisma } from "@/lib/prisma";
import { getBaseCost } from "@/lib/data/bases";
import { calculateUnitCost } from "@/lib/calculations/ingredientCost";
import { PerfumeForm } from "@/components/perfumes/perfume-form";

export const dynamic = "force-dynamic";

export default async function NewPerfumePage() {
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

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-foreground/45">Catálogo</p>
        <h1 className="font-display text-3xl">Novo perfume</h1>
        <p className="mt-1 text-sm text-foreground/55">
          Preencha os dados — custo, preço e margem são calculados automaticamente, em tempo real.
        </p>
      </div>
      <PerfumeForm
        bases={basesWithCost}
        bottles={bottles.map((b) => ({ id: b.id, label: `${b.volumeMl}ml — ${b.model ?? "frasco"}`, volumeMl: b.volumeMl, price: b.price }))}
        ingredients={ingredientOptions}
      />
    </div>
  );
}
