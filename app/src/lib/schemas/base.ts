import { z } from "zod";

export const baseItemSchema = z.object({
  ingredientId: z.string().min(1),
  percentage: z.number().min(0).max(1),
});

export const baseFormSchema = z.object({
  name: z.string().min(2, "Informe o nome da base"),
  batchSize: z.number().positive(),
  notes: z.string().optional(),
  items: z.array(baseItemSchema).min(1, "Adicione ao menos um ingrediente"),
});

export type BaseFormPayload = z.infer<typeof baseFormSchema>;
