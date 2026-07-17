import { PerfumeCostInput, PerfumeCostResult } from "./types";
import { calculateEssenceQuantity, calculateHedioneQuantity, calculateBaseQuantity } from "./quantities";
import { calculateCostForVolume } from "./ingredientCost";
import { calculateSalePrice, calculateProfit, calculateMargin, calculateMarkup, calculateROI } from "./pricing";

/**
 * Custo e precificação completos de um perfume, replicando as colunas
 * F:L das tabelas "Mistura essência + base" da planilha (para qualquer volume).
 */
export function calculatePerfumeCost(input: PerfumeCostInput): PerfumeCostResult {
  const {
    volumeMl,
    essencePercentage,
    essenceCostPerMl,
    hedionePercentage,
    hedioneCostPerMl,
    baseCostPerMl,
    bottleCost,
    marginTarget,
  } = input;

  const essenceQuantityMl = calculateEssenceQuantity(volumeMl, essencePercentage);
  const hedioneQuantityMl = calculateHedioneQuantity(volumeMl, hedionePercentage);
  const baseQuantityMl = calculateBaseQuantity(volumeMl, essencePercentage);

  const essenceCost = calculateCostForVolume(essenceCostPerMl, essenceQuantityMl);
  const hedioneCost = calculateCostForVolume(hedioneCostPerMl, hedioneQuantityMl);
  const baseCost = calculateCostForVolume(baseCostPerMl, baseQuantityMl);

  const totalCost = essenceCost + hedioneCost + baseCost + bottleCost;
  const salePrice = calculateSalePrice(totalCost, marginTarget);
  const profit = calculateProfit(salePrice, totalCost);
  const margin = calculateMargin(salePrice, totalCost);
  const markup = calculateMarkup(salePrice, totalCost);
  const roi = calculateROI(profit, totalCost);

  return {
    essenceQuantityMl,
    hedioneQuantityMl,
    baseQuantityMl,
    essenceCost,
    hedioneCost,
    baseCost,
    bottleCost,
    totalCost,
    salePrice,
    profit,
    margin,
    markup,
    roi,
  };
}
