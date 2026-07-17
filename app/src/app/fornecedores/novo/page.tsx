import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createSupplier } from "../actions";

export default function NewSupplierPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link href="/fornecedores" className="inline-flex items-center gap-1.5 text-sm text-foreground/55 hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Voltar
      </Link>
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-foreground/45">Parceiros</p>
        <h1 className="font-display text-3xl">Novo fornecedor</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do fornecedor</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createSupplier} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" required placeholder="Ex: Perfumaria Insumos LTDA" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" name="phone" placeholder="Opcional" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input id="whatsapp" name="whatsapp" placeholder="Opcional" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" type="email" placeholder="Opcional" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="website">Site</Label>
                <Input id="website" name="website" placeholder="Opcional" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address">Endereço</Label>
              <Input id="address" name="address" placeholder="Opcional" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Observações</Label>
              <Input id="notes" name="notes" placeholder="Opcional" />
            </div>
            <Button type="submit" size="lg" className="w-full">
              Salvar fornecedor
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
