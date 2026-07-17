/** Preço de venda a partir do custo total e da margem desejada: custo / (1 - margem). */
export function calculateSalePrice(totalCost: number, marginTarget: number): number {
  if (marginTarget >= 1) return Infinity;
  return totalCost / (1 - marginTarget);
}

export function calculateProfit(salePrice: number, totalCost: number): number {
  return salePrice - totalCost;
}

/** Margem realizada = lucro / preço de venda. */
export function calculateMargin(salePrice: number, totalCost: number): number {
  if (salePrice <= 0) return 0;
  return (salePrice - totalCost) / salePrice;
}

/** Markup = preço de venda / custo total. */
export function calculateMarkup(salePrice: number, totalCost: number): number {
  if (totalCost <= 0) return 0;
  return salePrice / totalCost;
}

/** ROI = lucro / custo investido. */
export function calculateROI(profit: number, totalCost: number): number {
  if (totalCost <= 0) return 0;
  return profit / totalCost;
}
