import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { updateBottle } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditBottlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const bottle = await prisma.bottle.findUnique({
    where: { id },
  });

  if (!bottle || bottle.deletedAt) {
    notFound();
  }

  const suppliers = await prisma.supplier.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
  });

  const updateBottleWithId = updateBottle.bind(null, id);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link href="/frascos" className="inline-flex items-center gap-1.5 text-sm text-foreground/55 hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Voltar
      </Link>
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-foreground/45">Embalagens</p>
        <h1 className="font-display text-3xl">Editar frasco</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do frasco</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateBottleWithId} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="volumeMl">Volume (ml)</Label>
                <Input id="volumeMl" name="volumeMl" type="number" step="1" required defaultValue={bottle.volumeMl} placeholder="Ex: 30" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="price">Preço (R$)</Label>
                <Input id="price" name="price" type="number" step="0.01" required defaultValue={bottle.price} placeholder="Ex: 7.00" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="color">Cor</Label>
                <Input id="color" name="color" defaultValue={bottle.color ?? ""} placeholder="Opcional" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="model">Modelo</Label>
                <Input id="model" name="model" defaultValue={bottle.model ?? ""} placeholder="Ex: Spray padrão" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="weightG">Peso (g)</Label>
                <Input id="weightG" name="weightG" type="number" step="0.1" defaultValue={bottle.weightG ?? ""} placeholder="Opcional" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="quantity">Estoque</Label>
                <Input id="quantity" name="quantity" type="number" step="1" defaultValue={bottle.quantity} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="supplierId">Fornecedor</Label>
              <Select id="supplierId" name="supplierId" defaultValue={bottle.supplierId ?? ""}>
                <option value="">Nenhum</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex gap-4 pt-2">
              <Link href="/frascos" className="flex-1">
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
