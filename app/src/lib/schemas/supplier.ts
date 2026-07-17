import { z } from "zod";

export const supplierFormSchema = z.object({
  name: z.string().min(2, "Informe o nome"),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  website: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export type SupplierFormValues = z.infer<typeof supplierFormSchema>;
