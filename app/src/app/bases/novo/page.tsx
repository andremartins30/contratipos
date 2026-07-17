import { prisma } from "@/lib/prisma";
import { calculateUnitCost } from "@/lib/calculations/ingredientCost";
import { BaseForm } from "@/components/bases/base-form";

export const dynamic = "force-dynamic";

export default async function NewBasePage() {
  const ingredients = await prisma.ingredient.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-foreground/45">Fórmulas</p>
        <h1 className="font-display text-3xl">Nova base</h1>
        <p className="mt-1 text-sm text-foreground/55">
          Monte a composição percentual da base — o custo por ml é calculado automaticamente a
          partir do preço cadastrado de cada matéria-prima.
        </p>
      </div>
      <BaseForm
        ingredients={ingredients.map((i) => ({
          id: i.id,
          name: i.name,
          unitCost: calculateUnitCost({ purchasePrice: i.purchasePrice, purchaseVolume: i.purchaseVolume }),
        }))}
      />
    </div>
  );
}
