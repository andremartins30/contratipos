"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { perfumeFormSchema } from "@/lib/schemas/perfume";

export async function createPerfume(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());

  // Os campos de percentual e margem chegam do formulário como pontos percentuais (ex: 23.5),
  // mas o motor de cálculo e o schema trabalham com frações (0..1).
  const toFraction = (value: FormDataEntryValue | undefined) =>
    value === undefined || value === "" ? value : String(Number(value) / 100);

  const normalized = {
    ...raw,
    essencePercentage: toFraction(raw.essencePercentage),
    hedionePercentage: toFraction(raw.hedionePercentage),
    marginTarget: toFraction(raw.marginTarget),
  };

  const parsed = perfumeFormSchema.safeParse(normalized);

  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const data = parsed.data;

  await prisma.perfume.create({
    data: {
      name: data.name,
      inspiredBrand: data.inspiredBrand || null,
      family: data.family,
      concentration: data.concentration,
      description: data.description || null,
      essencePercentage: data.essencePercentage,
      essenceIngredientId: formData.get("essenceIngredientId") as string,
      hedionePercentage: data.hedionePercentage,
      hedioneIngredientId: (formData.get("hedioneIngredientId") as string) || null,
      baseId: data.baseId,
      bottleId: data.bottleId,
      quantityProduced: data.quantityProduced,
      marginTarget: data.marginTarget,
      status: data.status,
      notes: data.notes || null,
    },
  });

  revalidatePath("/perfumes");
  redirect("/perfumes");
}
