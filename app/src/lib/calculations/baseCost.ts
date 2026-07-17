import { BaseCompositionItem, BaseCostResult } from "./types";

/**
 * Custo de uma Base universal, replicando a Etapa 1 da planilha:
 * cada ingrediente entra como (percentual do lote) * (tamanho do lote) * (custo/unidade).
 */
export function calculateBaseCost(
  composition: BaseCompositionItem[],
  batchSize: number
): BaseCostResult {
  const byIngredient = composition.map((item) => ({
    ingredientId: item.ingredientId,
    cost: item.percentage * batchSize * item.unitCost,
  }));

  const totalBatchCost = byIngredient.reduce((sum, i) => sum + i.cost, 0);
  const costPerMl = batchSize > 0 ? totalBatchCost / batchSize : 0;

  return { totalBatchCost, costPerMl, byIngredient };
}

/** Custo da base para volumes de referência comuns, a partir do custo/ml. */
export function calculateBaseCostForVolumes(costPerMl: number) {
  return {
    perMl: costPerMl,
    perLiter: costPerMl * 1000,
    per30ml: costPerMl * 30,
    per50ml: costPerMl * 50,
    per100ml: costPerMl * 100,
  };
}
