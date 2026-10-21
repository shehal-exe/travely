"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteDestination } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import type { Destination } from "@/types/database";

export function AdminDestinations({ destinations }: { destinations: Destination[] }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="divide-y divide-slate-100 rounded-[1.5rem] bg-white ring-1 ring-slate-200">
      {destinations.map((item) => (
        <div key={item.id} className="flex items-center justify-between gap-4 p-4">
          <div><p className="font-semibold">{item.name}</p><p className="text-sm text-slate-500">{item.country} · /{item.slug}</p></div>
          {item.is_sample ? <span className="text-xs font-semibold text-slate-500">Built-in</span> : (
            <Button variant="ghost" size="sm" disabled={pending} onClick={() => {
              if (!window.confirm(`Delete ${item.name}? Associated memories will keep their text destination.`)) return;
              startTransition(async () => {
                const result = await deleteDestination(item.id);
                if (result.error) toast.error(result.error);
                else toast.success("Destination deleted");
              });
            }}><Trash2 size={15} /> Delete</Button>
          )}
        </div>
      ))}
    </div>
  );
}
