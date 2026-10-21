"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteMemory } from "@/actions/memories";
import { Button, buttonClasses } from "@/components/ui/button";

export function MemoryManageActions({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return <div className="mt-3 flex gap-2"><Link href={`/journal/${id}/edit`} className={buttonClasses({ variant: "outline", size: "sm" })}><Pencil size={15} /> Edit</Link><Button type="button" variant="danger" size="sm" disabled={pending} onClick={() => { if (window.confirm("Delete this memory and all its photographs? This cannot be undone.")) startTransition(async () => { const result = await deleteMemory(id); if (result?.error) toast.error(result.error); }); }}><Trash2 size={15} /> {pending ? "Deleting…" : "Delete"}</Button></div>;
}
