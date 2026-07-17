"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { bottleFormSchema } from "@/lib/schemas/bottle";

export async function createBottle(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = bottleFormSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }
  const data = parsed.data;

  await prisma.bottle.create({
    data: {
      volumeMl: data.volumeMl,
      price: data.price,
      color: data.color || null,
      model: data.model || null,
      weightG: data.weightG ?? null,
      quantity: data.quantity,
      supplierId: data.supplierId || null,
    },
  });

  revalidatePath("/frascos");
  redirect("/frascos");
}

export async function deleteBottle(id: string) {
  await prisma.bottle.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath("/frascos");
}
