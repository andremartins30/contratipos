"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ingredientFormSchema } from "@/lib/schemas/ingredient";

export async function createIngredient(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = ingredientFormSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }
  const data = parsed.data;

  await prisma.ingredient.create({
    data: {
      name: data.name,
      category: data.category as never,
      unit: data.unit,
      purchaseVolume: data.purchaseVolume,
      purchasePrice: data.purchasePrice,
      remainingVolume: data.remainingVolume ?? null,
      batchCode: data.batchCode || null,
      supplierId: data.supplierId || null,
      notes: data.notes || null,
    },
  });

  revalidatePath("/materias-primas");
  redirect("/materias-primas");
}

export async function deleteIngredient(id: string) {
  await prisma.ingredient.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath("/materias-primas");
}
