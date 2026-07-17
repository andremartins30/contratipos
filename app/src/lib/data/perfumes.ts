import { prisma } from "@/lib/prisma";
import { calculateUnitCost } from "@/lib/calculations/ingredientCost";
import { calculatePerfumeCost } from "@/lib/calculations/perfumeCost";
import { getBaseCost } from "@/lib/data/bases";
import type { PerfumeCostResult } from "@/lib/calculations/types";

export async function listPerfumesWithCost() {
  const perfumes = await prisma.perfume.findMany({
    where: { deletedAt: null },
    include: { base: true, bottle: true, essenceIngredient: true, hedioneIngredient: true },
    orderBy: { name: "asc" },
  });

  const results: { perfume: (typeof perfumes)[number]; cost: PerfumeCostResult }[] = [];

  for (const perfume of perfumes) {
    const baseCost = await getBaseCost(perfume.baseId);
    const essenceCostPerMl = calculateUnitCost({
      purchasePrice: perfume.essenceIngredient.purchasePrice,
      purchaseVolume: perfume.essenceIngredient.purchaseVolume,
    });
    const hedioneCostPerMl = perfume.hedioneIngredient
      ? calculateUnitCost({
          purchasePrice: perfume.hedioneIngredient.purchasePrice,
          purchaseVolume: perfume.hedioneIngredient.purchaseVolume,
        })
      : 0;

    const cost = calculatePerfumeCost({
      volumeMl: perfume.bottle.volumeMl,
      essencePercentage: perfume.essencePercentage,
      essenceCostPerMl,
      hedionePercentage: perfume.hedionePercentage,
      hedioneCostPerMl,
      baseCostPerMl: baseCost.costPerMl,
      bottleCost: perfume.bottle.price,
      marginTarget: perfume.marginTarget,
    });

    results.push({ perfume, cost });
  }

  return results;
}
