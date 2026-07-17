import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateSupplier } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditSupplierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supplier = await prisma.supplier.findUnique({
    where: { id },
  });

  if (!supplier || supplier.deletedAt) {
    notFound();
  }

  const updateSupplierWithId = updateSupplier.bind(null, id);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link href="/fornecedores" className="inline-flex items-center gap-1.5 text-sm text-foreground/55 hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Voltar
      </Link>
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-foreground/45">Parceiros</p>
        <h1 className="font-display text-3xl">Editar fornecedor</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do fornecedor</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateSupplierWithId} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" required defaultValue={supplier.name} placeholder="Ex: Perfumaria Insumos LTDA" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" name="phone" defaultValue={supplier.phone ?? ""} placeholder="Opcional" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input id="whatsapp" name="whatsapp" defaultValue={supplier.whatsapp ?? ""} placeholder="Opcional" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" type="email" defaultValue={supplier.email ?? ""} placeholder="Opcional" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="website">Site</Label>
                <Input id="website" name="website" defaultValue={supplier.website ?? ""} placeholder="Opcional" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address">Endereço</Label>
              <Input id="address" name="address" defaultValue={supplier.address ?? ""} placeholder="Opcional" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Observações</Label>
              <Input id="notes" name="notes" defaultValue={supplier.notes ?? ""} placeholder="Opcional" />
            </div>
            <div className="flex gap-4 pt-2">
              <Link href="/fornecedores" className="flex-1">
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
