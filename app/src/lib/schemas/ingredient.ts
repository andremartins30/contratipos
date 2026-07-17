import { z } from "zod";

export const ingredientFormSchema = z.object({
  name: z.string().min(2, "Informe o nome"),
  category: z.string().min(1, "Selecione a categoria"),
  unit: z.string().min(1),
  purchaseVolume: z.coerce.number().positive("Deve ser maior que zero"),
  purchasePrice: z.coerce.number().nonnegative(),
  remainingVolume: z.coerce.number().nonnegative().optional(),
  batchCode: z.string().optional(),
  supplierId: z.string().optional(),
  notes: z.string().optional(),
});

export type IngredientFormValues = z.infer<typeof ingredientFormSchema>;

export const CATEGORY_LABELS: Record<string, string> = {
  ALCOOL: "Álcool",
  FIXADOR: "Fixador",
  ALMISCAR: "Almíscar",
  MADEIRAS: "Madeiras",
  RESINAS: "Resinas",
  CITRICOS: "Cítricos",
  SINTETICOS: "Sintéticos",
  NATURAIS: "Naturais",
  FRASCOS: "Frascos",
  TAMPAS: "Tampas",
  VALVULAS: "Válvulas",
  CORANTES: "Corantes",
  SOLVENTES: "Solventes",
  ESSENCIA: "Essência",
};
