import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { listBasesWithComposition } from "@/lib/data/bases";
import { calculateUnitCost } from "@/lib/calculations/ingredientCost";
import { ProjectForm } from "@/components/projects/project-form";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: { materialCosts: true },
  });

  if (!project) {
    notFound();
  }

  if (project.status === "PROMOVIDO") {
    redirect(`/projetos/${id}`);
  }

  const [bases, bottles, ingredients] = await Promise.all([
    listBasesWithComposition(),
    prisma.bottle.findMany({ where: { deletedAt: null }, orderBy: { volumeMl: "asc" } }),
    prisma.ingredient.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
  ]);

  const ingredientOptions = ingredients.map((i) => ({
    id: i.id,
    name: i.name,
    category: i.category,
    unitCost: calculateUnitCost({ purchasePrice: i.purchasePrice, purchaseVolume: i.purchaseVolume }),
  }));

  const initialProjectData = {
    id: project.id,
    name: project.name,
    essencePercentage: project.essencePercentage,
    essenceIngredientId: project.essenceIngredientId,
    hedionePercentage: project.hedionePercentage,
    hedioneIngredientId: project.hedioneIngredientId,
    baseId: project.baseId,
    bottleId: project.bottleId,
    marginTarget: project.marginTarget,
    notes: project.notes,
    materialCosts: project.materialCosts.map((m) => ({
      ingredientId: m.ingredientId,
      useSystemPrice: m.useSystemPrice,
      manualUnitCost: m.manualUnitCost,
    })),
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href={`/projetos/${id}`} className="inline-flex items-center gap-1.5 text-sm text-foreground/55 hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Voltar ao projeto
      </Link>
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-foreground/45">Receitas</p>
        <h1 className="font-display text-3xl">Editar projeto</h1>
        <p className="mt-1 text-sm text-foreground/55">
          Atualize os dados e percentuais da simulação do seu contratipo.
        </p>
      </div>
      <ProjectForm
        bases={bases}
        bottles={bottles.map((b) => ({ id: b.id, label: `${b.volumeMl}ml — ${b.model ?? "frasco"}`, volumeMl: b.volumeMl, price: b.price }))}
        ingredients={ingredientOptions}
        initialData={initialProjectData}
      />
    </div>
  );
}
