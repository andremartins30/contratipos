import { z } from "zod";

export const perfumeFormSchema = z.object({
  name: z.string().min(2, "Informe o nome do perfume"),
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
  description: z.string().optional(),
  essencePercentage: z.coerce.number().min(0.01, "Mínimo 1%").max(0.6, "Máximo 60%"),
  hedionePercentage: z.coerce.number().min(0).max(0.1),
  baseId: z.string().min(1, "Selecione uma base"),
  bottleId: z.string().min(1, "Selecione um frasco"),
  quantityProduced: z.coerce.number().int().min(1),
  marginTarget: z.coerce.number().min(0).max(0.95),
  status: z.string().default("ATIVO"),
  notes: z.string().optional(),
});

export type PerfumeFormValues = z.infer<typeof perfumeFormSchema>;

export const FAMILY_LABELS: Record<string, string> = {
  CITRICO: "Cítrico",
  AROMATICO_FRESCO: "Aromático / Fresco",
  AROMATICO_GOURMAND: "Aromático / Gourmand",
  FLORAL: "Floral",
  ORIENTAL_GOURMAND: "Oriental / Gourmand",
  CHYPRE_FRUTADO: "Chypre Frutado",
  AMADEIRADO: "Amadeirado",
  OUTRO: "Outro",
};

export const CONCENTRATION_LABELS: Record<string, string> = {
  EDT: "Eau de Toilette",
  EDP: "Eau de Parfum",
  PARFUM: "Parfum",
  EXTRAIT: "Extrait de Parfum",
};
