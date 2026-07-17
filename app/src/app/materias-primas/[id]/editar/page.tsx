import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CATEGORY_LABELS } from "@/lib/schemas/ingredient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { updateIngredient } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditIngredientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const ingredient = await prisma.ingredient.findUnique({
    where: { id },
  });

  if (!ingredient || ingredient.deletedAt) {
    notFound();
  }

  const suppliers = await prisma.supplier.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
  });

  const updateIngredientWithId = updateIngredient.bind(null, id);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link href="/materias-primas" className="inline-flex items-center gap-1.5 text-sm text-foreground/55 hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Voltar
      </Link>
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-foreground/45">Estoque</p>
        <h1 className="font-display text-3xl">Editar matéria-prima</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do insumo</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateIngredientWithId} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" required defaultValue={ingredient.name} placeholder="Ex: Iso E Super" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="category">Categoria</Label>
                <Select id="category" name="category" required defaultValue={ingredient.category}>
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="unit">Unidade</Label>
                <Select id="unit" name="unit" required defaultValue={ingredient.unit}>
                  <option value="ml">ml</option>
                  <option value="g">g</option>
                  <option value="un">un</option>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="purchaseVolume">Quantidade comprada</Label>
                <Input
                  id="purchaseVolume"
                  name="purchaseVolume"
                  type="number"
                  step="0.01"
                  required
                  defaultValue={ingredient.purchaseVolume}
                  placeholder="Ex: 100"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="purchasePrice">Preço pago (R$)</Label>
                <Input
                  id="purchasePrice"
                  name="purchasePrice"
                  type="number"
                  step="0.01"
                  required
                  defaultValue={ingredient.purchasePrice}
                  placeholder="Ex: 37.49"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="remainingVolume">Estoque restante</Label>
                <Input
                  id="remainingVolume"
                  name="remainingVolume"
                  type="number"
                  step="0.01"
                  defaultValue={ingredient.remainingVolume ?? ""}
                  placeholder="Opcional"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="batchCode">Lote</Label>
                <Input id="batchCode" name="batchCode" defaultValue={ingredient.batchCode ?? ""} placeholder="Opcional" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="supplierId">Fornecedor</Label>
              <Select id="supplierId" name="supplierId" defaultValue={ingredient.supplierId ?? ""}>
                <option value="">Nenhum</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Observações</Label>
              <Input id="notes" name="notes" defaultValue={ingredient.notes ?? ""} placeholder="Opcional" />
            </div>
            <div className="flex gap-4 pt-2">
              <Link href="/materias-primas" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" className="flex-1">
                Salvar alterações
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
