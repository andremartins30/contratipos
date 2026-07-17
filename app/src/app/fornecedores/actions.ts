"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { supplierFormSchema } from "@/lib/schemas/supplier";

export async function createSupplier(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = supplierFormSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }
  const data = parsed.data;

  await prisma.supplier.create({
    data: {
      name: data.name,
      phone: data.phone || null,
      whatsapp: data.whatsapp || null,
      email: data.email || null,
      website: data.website || null,
      address: data.address || null,
      notes: data.notes || null,
    },
  });

  revalidatePath("/fornecedores");
  redirect("/fornecedores");
}

export async function deleteSupplier(id: string) {
  await prisma.supplier.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath("/fornecedores");
}

export async function updateSupplier(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = supplierFormSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }
  const data = parsed.data;

  await prisma.supplier.update({
    where: { id },
    data: {
      name: data.name,
      phone: data.phone || null,
      whatsapp: data.whatsapp || null,
      email: data.email || null,
      website: data.website || null,
      address: data.address || null,
      notes: data.notes || null,
    },
  });

  revalidatePath("/fornecedores");
  redirect("/fornecedores");
}
