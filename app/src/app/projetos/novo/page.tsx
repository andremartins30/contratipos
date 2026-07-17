import { prisma } from "@/lib/prisma";
import { listBasesWithComposition } from "@/lib/data/bases";
import { calculateUnitCost } from "@/lib/calculations/ingredientCost";
import { ProjectForm } from "@/components/projects/project-form";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const [bases, bottles, ingredients] = await Promise.all([
    listBasesWithComposition(),
    prisma.bottle.findMany({ where: { deletedAt: null }, orderBy: { volumeMl: "asc" } }),
    prisma.ingredient.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
  ]);

  const ingredientOptions = ingredients.map((i) => ({
    id: i.id,
    name: i.name,
    category: i.category,
    unitCost: calculateUnitCost({ purchasePrice: i.purchasePrice, purchaseVolume: i.purchaseVolume }),
  }));

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-foreground/45">Receitas</p>
        <h1 className="font-display text-3xl">Novo projeto</h1>
        <p className="mt-1 text-sm text-foreground/55">
          Escolha a base, a essência e os percentuais — a receita e o custo são calculados
          automaticamente. Use os valores cadastrados no sistema ou informe um custo manual por
          material.
        </p>
      </div>
      <ProjectForm
        bases={bases}
        bottles={bottles.map((b) => ({ id: b.id, label: `${b.volumeMl}ml — ${b.model ?? "frasco"}`, volumeMl: b.volumeMl, price: b.price }))}
        ingredients={ingredientOptions}
      />
    </div>
  );
}
