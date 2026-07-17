import { z } from "zod";

export const bottleFormSchema = z.object({
  volumeMl: z.coerce.number().positive("Deve ser maior que zero"),
  price: z.coerce.number().nonnegative(),
  color: z.string().optional(),
  model: z.string().optional(),
  weightG: z.coerce.number().nonnegative().optional(),
  quantity: z.coerce.number().int().nonnegative(),
  supplierId: z.string().optional(),
});

export type BottleFormValues = z.infer<typeof bottleFormSchema>;
