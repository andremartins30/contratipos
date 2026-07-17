"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteButton({
  action,
  id,
  label,
}: {
  action: (id: string) => Promise<void>;
  id: string;
  label: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={isPending}
      aria-label={label}
      onClick={() => {
        if (!window.confirm(label)) return;
        startTransition(() => action(id));
      }}
    >
      <Trash2 className="size-4 text-rosewood" />
    </Button>
  );
}
