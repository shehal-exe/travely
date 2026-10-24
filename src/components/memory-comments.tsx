"use client";

import { useActionState, useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import { MessageCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { addComment, deleteComment, type SocialActionState } from "@/actions/social";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import type { MemoryComment } from "@/types/database";

export function MemoryComments({ memoryId, comments, count, page, viewerId }: { memoryId: string; comments: MemoryComment[]; count: number; page: number; viewerId: string | null }) {
  const [state, action, pending] = useActionState(addComment, {} as SocialActionState);
  const [deleting, startTransition] = useTransition();
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.success) form.current?.reset(); }, [state]);
  return <section id="comments" className="mt-14 border-t border-slate-200 pt-10" aria-labelledby="comments-title">
    <h2 id="comments-title" className="flex items-center gap-3 font-serif text-3xl font-semibold text-[#123a50]"><MessageCircle size={25} className="text-[#0d6d67]" /> Comments <span className="text-lg font-sans text-slate-500">{count}</span></h2>
    {viewerId ? <form ref={form} action={action} className="mt-6 grid gap-3"><input type="hidden" name="memoryId" value={memoryId} /><label htmlFor="comment-body" className="text-sm font-semibold text-[#123a50]">Add to the conversation</label><Textarea id="comment-body" name="body" required minLength={2} maxLength={1000} placeholder="Share a helpful thought or question…" /><div className="flex items-center justify-between gap-4"><span className="text-xs text-slate-500">2–1,000 characters</span><Button type="submit" disabled={pending}>{pending ? "Posting…" : "Post comment"}</Button></div>{state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}{state.success && <p role="status" className="text-sm text-[#0d6d67]">{state.success}</p>}</form> : <p className="mt-5 text-sm text-slate-600"><Link href="/auth/login" className="font-bold text-[#0d6d67] underline">Sign in</Link> to join the conversation.</p>}
    {comments.length ? <div className="mt-8 space-y-4">{comments.map((comment) => <article key={comment.id} className="rounded-[1.4rem] border border-slate-200 bg-white p-5"><div className="flex items-start justify-between gap-3"><div>{comment.author?.username ? <Link href={`/profile/${comment.author.username}`} className="font-bold text-[#123a50] hover:text-[#0d6d67]">{comment.author.display_name}</Link> : <strong className="text-[#123a50]">TRAVELY member</strong>}<time dateTime={comment.created_at} className="ml-3 text-xs text-slate-500">{new Date(comment.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</time></div>{viewerId === comment.author_id && <button type="button" disabled={deleting} aria-label="Delete your comment" className="rounded-full p-2 text-slate-500 hover:bg-red-50 hover:text-red-700" onClick={() => startTransition(async () => { const result = await deleteComment(comment.id, memoryId); if (result.error) toast.error(result.error); else toast.success(result.success); })}><Trash2 size={16} /></button>}</div><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{comment.body}</p></article>)}</div> : <p className="mt-8 rounded-2xl bg-[#edf6f3] p-6 text-slate-600">No comments yet. Start the conversation.</p>}
    <nav aria-label="Comment pages" className="mt-6 flex gap-3 text-sm font-semibold text-[#0d6d67]">{page > 1 && <Link href={`?comments=${page - 1}#comments`}>← Newer comments</Link>}{page * 20 < count && <Link href={`?comments=${page + 1}#comments`}>Older comments →</Link>}</nav>
  </section>;
}
