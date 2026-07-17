import Link from "next/link";
import { Plus, Truck, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/shared/delete-button";
import { deleteSupplier } from "./actions";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
    include: { _count: { select: { ingredients: true, bottles: true } } },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-foreground/45">Parceiros</p>
          <h1 className="font-display text-3xl">Fornecedores</h1>
        </div>
        <Link href="/fornecedores/novo">
          <Button>
            <Plus className="size-4" />
            Novo fornecedor
          </Button>
        </Link>
      </div>

      {suppliers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <Truck className="mx-auto size-8 text-foreground/30" />
          <p className="mt-3 font-display text-lg">Nenhum fornecedor cadastrado</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-foreground/45">
                <th className="p-3 font-medium">Nome</th>
                <th className="p-3 font-medium">Telefone</th>
                <th className="p-3 font-medium">WhatsApp</th>
                <th className="p-3 font-medium">E-mail</th>
                <th className="p-3 font-medium">Produtos</th>
                <th className="p-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {suppliers.map((s) => (
                <tr key={s.id}>
                  <td className="p-3 font-medium">{s.name}</td>
                  <td className="p-3 text-foreground/70">{s.phone ?? "—"}</td>
                  <td className="p-3 text-foreground/70">{s.whatsapp ?? "—"}</td>
                  <td className="p-3 text-foreground/70">{s.email ?? "—"}</td>
                  <td className="p-3 font-mono tabular text-foreground/70">
                    {s._count.ingredients + s._count.bottles}
                  </td>
                  <td className="p-3 text-right flex items-center justify-end gap-1">
                    <Link href={`/fornecedores/${s.id}/editar`}>
                      <Button variant="ghost" size="icon" aria-label={`Editar ${s.name}`}>
                        <Pencil className="size-4 text-foreground/70 transition hover:text-accent" />
                      </Button>
                    </Link>
                    <DeleteButton action={deleteSupplier} id={s.id} label={`Remover ${s.name}?`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
