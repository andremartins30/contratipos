import Link from "next/link";
import { Plus, Droplets } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { calculateUnitCost } from "@/lib/calculations/ingredientCost";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORY_LABELS } from "@/lib/schemas/ingredient";
import { formatBRL } from "@/lib/format";
import { DeleteButton } from "@/components/shared/delete-button";
import { deleteIngredient } from "./actions";

export const dynamic = "force-dynamic";

export default async function IngredientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const ingredients = await prisma.ingredient.findMany({
    where: {
      deletedAt: null,
      ...(q ? { name: { contains: q } } : {}),
    },
    include: { supplier: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-foreground/45">Estoque</p>
          <h1 className="font-display text-3xl">Matérias-primas</h1>
        </div>
        <Link href="/materias-primas/novo">
          <Button>
            <Plus className="size-4" />
            Nova matéria-prima
          </Button>
        </Link>
      </div>

      <form className="max-w-xs">
        <Input type="search" name="q" defaultValue={q} placeholder="Buscar por nome..." />
      </form>

      {ingredients.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <Droplets className="mx-auto size-8 text-foreground/30" />
          <p className="mt-3 font-display text-lg">Nenhuma matéria-prima encontrada</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-foreground/45">
                <th className="p-3 font-medium">Nome</th>
                <th className="p-3 font-medium">Categoria</th>
                <th className="p-3 font-medium">Lote comprado</th>
                <th className="p-3 font-medium">Preço</th>
                <th className="p-3 font-medium">Custo/unidade</th>
                <th className="p-3 font-medium">Fornecedor</th>
                <th className="p-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ingredients.map((i) => {
                const unitCost = calculateUnitCost({ purchasePrice: i.purchasePrice, purchaseVolume: i.purchaseVolume });
                return (
                  <tr key={i.id}>
                    <td className="p-3 font-medium">{i.name}</td>
                    <td className="p-3 text-foreground/70">{CATEGORY_LABELS[i.category] ?? i.category}</td>
                    <td className="p-3 font-mono tabular text-foreground/70">
                      {i.purchaseVolume}
                      {i.unit}
                    </td>
                    <td className="p-3 font-mono tabular">{formatBRL(i.purchasePrice)}</td>
                    <td className="p-3 font-mono tabular text-accent">
                      {formatBRL(unitCost)}/{i.unit}
                    </td>
                    <td className="p-3 text-foreground/70">{i.supplier?.name ?? "—"}</td>
                    <td className="p-3 text-right">
                      <DeleteButton action={deleteIngredient} id={i.id} label={`Remover ${i.name}?`} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
