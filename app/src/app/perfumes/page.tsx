import Link from "next/link";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";
import { listPerfumesWithCost } from "@/lib/data/perfumes";
import { PerfumeCard } from "@/components/perfumes/perfume-card";
import { Button } from "@/components/ui/button";

export default async function PerfumesPage() {
  const items = await listPerfumesWithCost();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-foreground/45">Catálogo</p>
          <h1 className="font-display text-3xl">Perfumes</h1>
        </div>
        <Link href="/perfumes/novo">
          <Button>
            <Plus className="size-4" />
            Novo perfume
          </Button>
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="font-display text-lg">Nenhum perfume cadastrado ainda</p>
          <p className="mt-1 text-sm text-foreground/55">
            Cadastre o primeiro perfume para começar a calcular custos automaticamente.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map(({ perfume, cost }) => (
            <PerfumeCard
              key={perfume.id}
              id={perfume.id}
              name={perfume.name}
              inspiredBrand={perfume.inspiredBrand}
              family={perfume.family}
              concentration={perfume.concentration}
              volumeMl={perfume.bottle.volumeMl}
              cost={cost}
            />
          ))}
        </div>
      )}
    </div>
  );
}
