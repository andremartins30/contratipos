"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { baseFormSchema, type BaseFormPayload } from "@/lib/schemas/base";

export async function createBase(payload: BaseFormPayload) {
  const data = baseFormSchema.parse(payload);

  const base = await prisma.base.create({
    data: {
      name: data.name,
      batchSize: data.batchSize,
      notes: data.notes || null,
      items: {
        create: data.items.map((item) => ({ ingredientId: item.ingredientId, percentage: item.percentage })),
      },
    },
  });

  revalidatePath("/bases");
  return { id: base.id };
}

export async function deleteBase(id: string) {
  await prisma.base.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath("/bases");
}
