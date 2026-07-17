/** Tipos compartilhados pelo motor de cálculo. Nenhuma função aqui acessa banco de dados. */

export interface IngredientCost {
  /** preço pago pelo lote comprado */
  purchasePrice: number;
  /** volume/quantidade do lote comprado, na mesma unidade usada no cálculo (ml, g, un) */
  purchaseVolume: number;
}

export interface BaseCompositionItem {
  ingredientId: string;
  /** fração 0..1 do lote da base ocupada por este ingrediente */
  percentage: number;
  unitCost: number; // custo por ml/g/un do ingrediente
}

export interface BaseCostResult {
  totalBatchCost: number; // custo do lote inteiro (ex: 1000ml)
  costPerMl: number; // custo por ml da base pronta
  byIngredient: { ingredientId: string; cost: number }[];
}

export interface PerfumeCostInput {
  volumeMl: number; // volume do frasco (30, 50, 100...)
  essencePercentage: number; // 0..1
  essenceCostPerMl: number;
  hedionePercentage: number; // 0..1, específico do perfume
  hedioneCostPerMl: number;
  baseCostPerMl: number; // custo/ml da base universal usada
  bottleCost: number; // custo fixo do frasco/embalagem
  marginTarget: number; // 0..1
}

export interface PerfumeCostResult {
  essenceQuantityMl: number;
  hedioneQuantityMl: number;
  baseQuantityMl: number;
  essenceCost: number;
  hedioneCost: number;
  baseCost: number;
  bottleCost: number;
  totalCost: number;
  salePrice: number;
  profit: number;
  margin: number;
  markup: number;
  roi: number;
}
