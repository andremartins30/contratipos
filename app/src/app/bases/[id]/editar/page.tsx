import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { calculateUnitCost } from "@/lib/calculations/ingredientCost";
import { BaseForm } from "@/components/bases/base-form";

export const dynamic = "force-dynamic";

export default async function EditBasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const base = await prisma.base.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!base || base.deletedAt) {
    notFound();
  }

  const ingredients = await prisma.ingredient.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
  });

  const baseData = {
    id: base.id,
    name: base.name,
    batchSize: base.batchSize,
    notes: base.notes,
    items: base.items.map((item) => ({
      ingredientId: item.ingredientId,
      percentage: item.percentage,
    })),
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/bases" className="inline-flex items-center gap-1.5 text-sm text-foreground/55 hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Voltar
      </Link>
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-foreground/45">Fórmulas</p>
        <h1 className="font-display text-3xl">Editar base</h1>
        <p className="mt-1 text-sm text-foreground/55">
          Atualize a composição percentual da base — o custo por ml é recalculado automaticamente.
        </p>
      </div>
      <BaseForm
        ingredients={ingredients.map((i) => ({
          id: i.id,
          name: i.name,
          unitCost: calculateUnitCost({ purchasePrice: i.purchasePrice, purchaseVolume: i.purchaseVolume }),
        }))}
        initialData={baseData}
      />
    </div>
  );
}
