"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { promoteProjectToPerfume } from "@/app/projetos/actions";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FAMILY_LABELS, CONCENTRATION_LABELS } from "@/lib/schemas/perfume";

export function PromoteButton({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [family, setFamily] = useState("CITRICO");
  const [concentration, setConcentration] = useState("EDP");
  const [inspiredBrand, setInspiredBrand] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Sparkles className="size-4" />
        Promover a perfume
      </Button>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-3 rounded-lg border border-accent/40 bg-surface p-4">
      <p className="text-sm font-medium">Promover projeto a perfume do catálogo</p>
      <div className="space-y-1.5">
        <Label htmlFor="promote-family">Família olfativa</Label>
        <Select id="promote-family" value={family} onChange={(e) => setFamily(e.target.value)}>
          {Object.entries(FAMILY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="promote-concentration">Concentração</Label>
        <Select id="promote-concentration" value={concentration} onChange={(e) => setConcentration(e.target.value)}>
          {Object.entries(CONCENTRATION_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="promote-brand">Marca inspirada (opcional)</Label>
        <Input id="promote-brand" value={inspiredBrand} onChange={(e) => setInspiredBrand(e.target.value)} />
      </div>
      {error && <p className="text-xs text-rosewood">{error}</p>}
      <div className="flex gap-2">
        <Button
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              setError(null);
              try {
                await promoteProjectToPerfume({ projectId, family: family as never, concentration: concentration as never, inspiredBrand });
              } catch (err) {
                // redirect() no Server Action lança um erro especial (NEXT_REDIRECT) que deve
                // propagar para o Next.js concluir a navegação — não é uma falha real.
                if (err && typeof err === "object" && "digest" in err && String(err.digest).startsWith("NEXT_REDIRECT")) {
                  throw err;
                }
                setError(err instanceof Error ? err.message : "Não foi possível promover o projeto.");
              }
            })
          }
        >
          {isPending ? "Promovendo..." : "Confirmar"}
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}
