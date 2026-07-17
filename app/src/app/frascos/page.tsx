import Link from "next/link";
import { Plus, Wine } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/format";
import { DeleteButton } from "@/components/shared/delete-button";
import { deleteBottle } from "./actions";

export const dynamic = "force-dynamic";

export default async function BottlesPage() {
  const bottles = await prisma.bottle.findMany({
    where: { deletedAt: null },
    orderBy: { volumeMl: "asc" },
    include: { supplier: true },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-foreground/45">Embalagens</p>
          <h1 className="font-display text-3xl">Frascos</h1>
        </div>
        <Link href="/frascos/novo">
          <Button>
            <Plus className="size-4" />
            Novo frasco
          </Button>
        </Link>
      </div>

      {bottles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <Wine className="mx-auto size-8 text-foreground/30" />
          <p className="mt-3 font-display text-lg">Nenhum frasco cadastrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {bottles.map((b) => (
            <div key={b.id} className="rounded-xl border border-border bg-surface p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display text-2xl">{b.volumeMl}ml</p>
                  <p className="text-sm text-foreground/55">{b.model ?? "Modelo padrão"}</p>
                </div>
                <DeleteButton action={deleteBottle} id={b.id} label={`Remover frasco ${b.volumeMl}ml?`} />
              </div>
              <dl className="mt-4 space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-foreground/50">Preço</dt>
                  <dd className="font-mono tabular">{formatBRL(b.price)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-foreground/50">Cor</dt>
                  <dd>{b.color ?? "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-foreground/50">Estoque</dt>
                  <dd className="font-mono tabular">{b.quantity} un.</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-foreground/50">Fornecedor</dt>
                  <dd>{b.supplier?.name ?? "—"}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
