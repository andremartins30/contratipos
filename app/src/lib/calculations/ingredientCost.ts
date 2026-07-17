import { IngredientCost } from "./types";

/** Custo por unidade (ml, g ou un) de uma matéria-prima, a partir do lote comprado. */
export function calculateUnitCost({ purchasePrice, purchaseVolume }: IngredientCost): number {
  if (purchaseVolume <= 0) return 0;
  return purchasePrice / purchaseVolume;
}

export function calculateCostForVolume(unitCost: number, volume: number): number {
  return unitCost * volume;
}
