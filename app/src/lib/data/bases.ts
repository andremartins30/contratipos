import { prisma } from "@/lib/prisma";
import { calculateUnitCost } from "@/lib/calculations/ingredientCost";
import { calculateBaseCost } from "@/lib/calculations/baseCost";
import type { BaseCostResult } from "@/lib/calculations/types";

/** Busca uma Base com seus ingredientes e calcula o custo/ml a partir dos preços atuais. */
export async function getBaseCost(baseId: string): Promise<BaseCostResult> {
  const base = await prisma.base.findUniqueOrThrow({
    where: { id: baseId },
    include: { items: { include: { ingredient: true } } },
  });

  const composition = base.items.map((item) => ({
    ingredientId: item.ingredientId,
    percentage: item.percentage,
    unitCost: calculateUnitCost({
      purchasePrice: item.ingredient.purchasePrice,
      purchaseVolume: item.ingredient.purchaseVolume,
    }),
  }));

  return calculateBaseCost(composition, base.batchSize);
}

export async function listBasesWithCost() {
  const bases = await prisma.base.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } });
  return Promise.all(
    bases.map(async (base) => ({ base, cost: await getBaseCost(base.id) }))
  );
}

/**
 * Bases com a composição detalhada (nome e custo/unidade de cada ingrediente),
 * usado para montar dinamicamente as linhas de material no formulário de Projeto.
 */
export async function listBasesWithComposition() {
  const bases = await prisma.base.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
    include: { items: { include: { ingredient: true } } },
  });

  return bases.map((base) => ({
    id: base.id,
    name: base.name,
    batchSize: base.batchSize,
    items: base.items.map((item) => ({
      ingredientId: item.ingredientId,
      ingredientName: item.ingredient.name,
      percentage: item.percentage,
      unitCost: calculateUnitCost({
        purchasePrice: item.ingredient.purchasePrice,
        purchaseVolume: item.ingredient.purchaseVolume,
      }),
    })),
  }));
}
