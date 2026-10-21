"use client";

import { useState, useTransition } from "react";
import { Bookmark, Flag, Heart } from "lucide-react";
import { toast } from "sonner";
import { reportMemory, toggleRelation } from "@/actions/memories";
import { Button } from "@/components/ui/button";

export function MemoryActions({ memoryId }: { memoryId: string }) {
  const [pending, startTransition] = useTransition();
  const [reporting, setReporting] = useState(false);
  const run = (table: "memory_likes" | "saved_memories", label: string) => startTransition(async () => {
    const result = await toggleRelation(table, memoryId);
    if (result.error) toast.error(result.error);
    else toast.success(label);
  });
  return <div className="mt-8 flex flex-wrap gap-3"><Button variant="outline" disabled={pending} onClick={() => run("memory_likes", "Like updated")}><Heart size={17} /> Like</Button><Button variant="outline" disabled={pending} onClick={() => run("saved_memories", "Saved collection updated")}><Bookmark size={17} /> Save</Button><Button variant="ghost" onClick={() => setReporting(!reporting)}><Flag size={17} /> Report</Button>{reporting && <form className="flex w-full max-w-xl gap-2" onSubmit={(event) => { event.preventDefault(); const reason = new FormData(event.currentTarget).get("reason") as string; startTransition(async () => { const result = await reportMemory(memoryId, reason); if (result.error) toast.error(result.error); else toast.success("Report submitted"); setReporting(false); }); }}><input name="reason" minLength={10} required className="min-h-11 flex-1 rounded-full border border-slate-200 px-4" placeholder="Why should this be reviewed?" /><Button type="submit" size="sm">Submit report</Button></form>}</div>;
}
