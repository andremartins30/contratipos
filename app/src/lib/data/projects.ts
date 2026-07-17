import { prisma } from "@/lib/prisma";
import { calculateUnitCost } from "@/lib/calculations/ingredientCost";
import { calculateBaseCost } from "@/lib/calculations/baseCost";
import { calculatePerfumeCost } from "@/lib/calculations/perfumeCost";
import type { PerfumeCostResult, BaseCostResult } from "@/lib/calculations/types";

export type ProjectWithRelations = NonNullable<Awaited<ReturnType<typeof getProjectWithRelations>>>;

export async function getProjectWithRelations(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      base: { include: { items: { include: { ingredient: true } } } },
      bottle: true,
      essenceIngredient: true,
      hedioneIngredient: true,
      materialCosts: { include: { ingredient: true } },
    },
  });
}

/** Custo/unidade de um ingrediente, respeitando o override manual do projeto quando presente. */
function resolveUnitCost(
  ingredient: { purchasePrice: number; purchaseVolume: number },
  override?: { useSystemPrice: boolean; manualUnitCost: number | null }
) {
  if (override && !override.useSystemPrice && override.manualUnitCost != null) {
    return override.manualUnitCost;
  }
  return calculateUnitCost({ purchasePrice: ingredient.purchasePrice, purchaseVolume: ingredient.purchaseVolume });
}

export interface ProjectCostBreakdown {
  cost: PerfumeCostResult;
  baseCost: BaseCostResult;
  baseCostPerMl: number;
  essenceCostPerMl: number;
  hedioneCostPerMl: number;
  volumeMl: number;
  bottleCost: number;
}

/** Recalcula o custo completo de um Projeto a partir dos preços atuais (ou overrides manuais). */
export function computeProjectCost(project: ProjectWithRelations): ProjectCostBreakdown {
  const overridesByIngredient = new Map(
    project.materialCosts.map((m) => [m.ingredientId, { useSystemPrice: m.useSystemPrice, manualUnitCost: m.manualUnitCost }])
  );

  const baseComposition = project.base.items.map((item) => ({
    ingredientId: item.ingredientId,
    percentage: item.percentage,
    unitCost: resolveUnitCost(item.ingredient, overridesByIngredient.get(item.ingredientId)),
  }));
  const baseCost = calculateBaseCost(baseComposition, project.base.batchSize);

  const essenceCostPerMl = resolveUnitCost(
    project.essenceIngredient,
    overridesByIngredient.get(project.essenceIngredientId)
  );
  const hedioneCostPerMl = project.hedioneIngredient
    ? resolveUnitCost(project.hedioneIngredient, overridesByIngredient.get(project.hedioneIngredientId ?? ""))
    : 0;

  const volumeMl = project.bottle?.volumeMl ?? project.volumeMl;
  const bottleCost = project.bottle?.price ?? 0;

  const cost = calculatePerfumeCost({
    volumeMl,
    essencePercentage: project.essencePercentage,
    essenceCostPerMl,
    hedionePercentage: project.hedionePercentage,
    hedioneCostPerMl,
    baseCostPerMl: baseCost.costPerMl,
    bottleCost,
    marginTarget: project.marginTarget,
  });

  return { cost, baseCost, baseCostPerMl: baseCost.costPerMl, essenceCostPerMl, hedioneCostPerMl, volumeMl, bottleCost };
}

export async function listProjectsWithCost() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      base: { include: { items: { include: { ingredient: true } } } },
      bottle: true,
      essenceIngredient: true,
      hedioneIngredient: true,
      materialCosts: { include: { ingredient: true } },
    },
  });

  return projects.map((project) => ({ project, breakdown: computeProjectCost(project) }));
}
