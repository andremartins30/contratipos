"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { projectFormSchema, promoteProjectSchema, type ProjectFormPayload, type PromoteProjectPayload } from "@/lib/schemas/project";

export async function createProject(payload: ProjectFormPayload) {
  const data = projectFormSchema.parse(payload);

  const project = await prisma.project.create({
    data: {
      name: data.name,
      essencePercentage: data.essencePercentage,
      essenceIngredientId: data.essenceIngredientId,
      hedionePercentage: data.hedionePercentage,
      hedioneIngredientId: data.hedioneIngredientId || null,
      baseId: data.baseId,
      bottleId: data.bottleId,
      marginTarget: data.marginTarget,
      notes: data.notes || null,
      materialCosts: {
        create: data.materials.map((m) => ({
          ingredientId: m.ingredientId,
          useSystemPrice: m.useSystemPrice,
          manualUnitCost: m.useSystemPrice ? null : m.manualUnitCost ?? null,
        })),
      },
    },
  });

  revalidatePath("/projetos");
  return { id: project.id };
}

export async function promoteProjectToPerfume(payload: PromoteProjectPayload) {
  const data = promoteProjectSchema.parse(payload);

  const project = await prisma.project.findUniqueOrThrow({ where: { id: data.projectId } });

  if (project.status === "PROMOVIDO" && project.promotedPerfumeId) {
    redirect(`/perfumes/${project.promotedPerfumeId}`);
  }

  const perfume = await prisma.perfume.create({
    data: {
      name: project.name,
      inspiredBrand: data.inspiredBrand || null,
      family: data.family,
      concentration: data.concentration,
      essencePercentage: project.essencePercentage,
      essenceIngredientId: project.essenceIngredientId,
      hedionePercentage: project.hedionePercentage,
      hedioneIngredientId: project.hedioneIngredientId,
      baseId: project.baseId,
      bottleId: project.bottleId!,
      marginTarget: project.marginTarget,
      notes: project.notes,
      status: "ATIVO",
    },
  });

  await prisma.project.update({
    where: { id: project.id },
    data: { status: "PROMOVIDO", promotedPerfumeId: perfume.id },
  });

  revalidatePath("/perfumes");
  revalidatePath(`/projetos/${project.id}`);
  redirect(`/perfumes/${perfume.id}`);
}
