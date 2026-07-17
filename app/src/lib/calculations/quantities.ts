/** Quantidade de essência (ml) para um dado volume e percentual de concentração. */
export function calculateEssenceQuantity(volumeMl: number, essencePercentage: number): number {
  return volumeMl * essencePercentage;
}

/** Quantidade de hedione (ml), fixador comum adicionado por fora da base. */
export function calculateHedioneQuantity(volumeMl: number, hedionePercentage: number): number {
  return volumeMl * hedionePercentage;
}

/**
 * Quantidade de base (ml) que preenche o restante do volume não ocupado pela essência.
 * Replica a planilha: "Base a retirar" = (1 - %essência) * volume.
 */
export function calculateBaseQuantity(volumeMl: number, essencePercentage: number): number {
  return volumeMl * (1 - essencePercentage);
}
