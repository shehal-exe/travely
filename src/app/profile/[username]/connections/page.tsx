import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfileConnections } from "@/lib/social-data";
import { getSupabaseServer } from "@/lib/supabase/server";

export default async function ConnectionsPage({ params, searchParams }: { params: Promise<{ username: string }>; searchParams: Promise<{ view?: string; page?: string }> }) {
  const [{ username }, query] = await Promise.all([params, searchParams]);
  const supabase = await getSupabaseServer();
  if (!supabase) notFound();
  const { data: profile } = await supabase.from("profiles").select("id, display_name").eq("username", username).maybeSingle();
  if (!profile) notFound();
  const kind = query.view === "following" ? "following" : "followers";
  const page = Math.min(60, Math.max(1, Number.parseInt(query.page ?? "1", 10) || 1));
  const result = await getProfileConnections(profile.id, kind, page);
  return <section className="section-shell max-w-4xl py-16"><Link href={`/profile/${username}`} className="text-sm font-bold text-[#0d6d67]">← {profile.display_name}</Link><h1 className="mt-4 font-serif text-5xl text-[#123a50]">Traveller connections</h1><nav className="mt-8 flex gap-3 text-sm font-semibold"><Link href="?view=followers" className={`rounded-full px-5 py-3 ${kind === "followers" ? "bg-[#0d6d67] text-white" : "bg-white text-[#123a50]"}`}>Followers</Link><Link href="?view=following" className={`rounded-full px-5 py-3 ${kind === "following" ? "bg-[#0d6d67] text-white" : "bg-white text-[#123a50]"}`}>Following</Link></nav>{result.error && <p role="alert" className="mt-6 text-red-700">{result.error}</p>}{result.profiles.length ? <div className="mt-8 grid gap-3">{result.profiles.map((person) => <Link key={person.id} href={`/profile/${person.username}`} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-[#0d6d67]"><strong className="text-[#123a50]">{person.display_name}</strong><span className="ml-3 text-sm text-slate-500">@{person.username}</span>{person.bio && <p className="mt-2 line-clamp-2 text-sm text-slate-600">{person.bio}</p>}</Link>)}</div> : !result.error && <p className="mt-8 text-slate-600">No {kind} yet.</p>}<div className="mt-8 flex gap-4 text-sm font-semibold text-[#0d6d67]">{page > 1 && <Link href={`?view=${kind}&page=${page - 1}`}>← Previous</Link>}{result.hasMore && <Link href={`?view=${kind}&page=${page + 1}`}>Next →</Link>}</div></section>;
}
