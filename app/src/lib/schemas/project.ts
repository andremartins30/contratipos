import { z } from "zod";

export const projectMaterialSchema = z.object({
  ingredientId: z.string().min(1),
  useSystemPrice: z.boolean(),
  manualUnitCost: z.number().nonnegative().optional(),
});

export const projectFormSchema = z.object({
  name: z.string().min(2, "Informe o nome do projeto"),
  essencePercentage: z.number().min(0.01, "Mínimo 1%").max(0.6, "Máximo 60%"),
  essenceIngredientId: z.string().min(1, "Selecione a essência"),
  hedionePercentage: z.number().min(0).max(0.1),
  hedioneIngredientId: z.string().optional(),
  baseId: z.string().min(1, "Selecione uma base"),
  bottleId: z.string().min(1, "Selecione um frasco"),
  marginTarget: z.number().min(0).max(0.95),
  notes: z.string().optional(),
  materials: z.array(projectMaterialSchema),
});

export type ProjectFormPayload = z.infer<typeof projectFormSchema>;

export const promoteProjectSchema = z.object({
  projectId: z.string().min(1),
  inspiredBrand: z.string().optional(),
  family: z.enum([
    "CITRICO",
    "AROMATICO_FRESCO",
    "AROMATICO_GOURMAND",
    "FLORAL",
    "ORIENTAL_GOURMAND",
    "CHYPRE_FRUTADO",
    "AMADEIRADO",
    "OUTRO",
  ]),
  concentration: z.enum(["EDT", "EDP", "PARFUM", "EXTRAIT"]),
});

export type PromoteProjectPayload = z.infer<typeof promoteProjectSchema>;
