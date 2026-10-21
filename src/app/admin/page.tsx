import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BookOpen, Database, ExternalLink, Flag, Images, LayoutDashboard, Map as MapIcon, NotebookTabs, Plus, Search, ShieldCheck, Users } from "lucide-react";
import { createDestination, updateReportStatus } from "@/actions/admin";
import { AdminDestinations } from "@/components/admin-destinations";
import { AdminPeople, type AdminUser } from "@/components/admin-people";
import { Button, buttonClasses } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/field";
import { getCurrentUser, getSupabaseServer } from "@/lib/supabase/server";
import type { Destination } from "@/types/database";

type Tab = "overview" | "people" | "reports" | "destinations" | "database";
type Report = { id: string; memory_id: string; reporter_id: string; reason: string; status: string; created_at: string };
type ReportMemory = { id: string; title: string; destination_name: string; user_id: string };
type ReportProfile = { id: string; display_name: string; username: string };

const tabs = [
  { id: "overview", label: "Overview", Icon: LayoutDashboard },
  { id: "people", label: "People & access", Icon: Users },
  { id: "reports", label: "Reports", Icon: Flag },
  { id: "destinations", label: "Destinations", Icon: MapIcon },
  { id: "database", label: "Database", Icon: Database },
] as const;

const panel = "rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm";

function readableDate(value: string | null) {
  return value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Not signed in yet";
}

export default async function AdminPage({ searchParams }: {
  searchParams: Promise<{ tab?: string; error?: string; message?: string; q?: string; page?: string }>;
}) {
  const user = await getCurrentUser();
  const supabase = await getSupabaseServer();
  if (!user || !supabase) redirect("/auth/login");

  const { data: role } = await supabase.from("user_roles")
    .select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
  if (!role) return <section className="section-shell py-20"><h1 className="display-heading text-4xl">Administrator access required</h1><p className="mt-4 text-slate-600">This area is only available to TRAVELY administrators.</p><Link href="/journal" className={buttonClasses({ className: "mt-7" })}>Go to my portal</Link></section>;

  const params = await searchParams;
  const tab: Tab = tabs.some((item) => item.id === params.tab) ? params.tab as Tab : "overview";
  const search = (params.q ?? "").trim().slice(0, 120);
  const page = Math.min(10000, Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1));
  const [userCount, storyCount, destinationCount, openReportCount] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("travel_memories").select("id", { count: "exact", head: true }).eq("visibility", "public"),
    supabase.from("destinations").select("id", { count: "exact", head: true }),
    supabase.from("content_reports").select("id", { count: "exact", head: true }).eq("status", "open"),
  ]);
  const stats = [
    { Icon: Users, label: "Registered members", value: userCount.count ?? 0, href: "/admin?tab=people" },
    { Icon: NotebookTabs, label: "Public stories", value: storyCount.count ?? 0, href: "/explore" },
    { Icon: MapIcon, label: "Destinations", value: destinationCount.count ?? 0, href: "/admin?tab=destinations" },
    { Icon: Flag, label: "Open reports", value: openReportCount.count ?? 0, href: "/admin?tab=reports" },
  ];

  const peopleResult = tab === "people" || tab === "overview"
    ? await supabase.rpc("admin_list_users", { p_search: tab === "people" ? search : "", p_page: tab === "people" ? page : 1 })
    : null;
  const people = (peopleResult?.data ?? []) as AdminUser[];
  const peopleTotal = Number(people[0]?.total_count ?? 0);
  const destinationRows = tab === "destinations" ? await supabase.from("destinations").select("*").order("name") : null;
  const reportsResult = tab === "reports" ? await supabase.from("content_reports").select("id,memory_id,reporter_id,reason,status,created_at").order("created_at", { ascending: false }).limit(100) : null;
  const reports = (reportsResult?.data ?? []) as Report[];
  const [reportedMemories, reporters] = tab === "reports" && reports.length ? await Promise.all([
    supabase.from("travel_memories").select("id,title,destination_name,user_id").in("id", reports.map((item) => item.memory_id)),
    supabase.from("profiles").select("id,display_name,username").in("id", reports.map((item) => item.reporter_id)),
  ]) : [{ data: [] }, { data: [] }];
  const memoryById = new Map(((reportedMemories.data ?? []) as ReportMemory[]).map((item) => [item.id, item]));
  const reporterById = new Map(((reporters.data ?? []) as ReportProfile[]).map((item) => [item.id, item]));

  const extraCounts = tab === "database" ? await Promise.all([
    supabase.from("travel_memories").select("id", { count: "exact", head: true }),
    supabase.from("memory_images").select("id", { count: "exact", head: true }),
    supabase.from("saved_memories").select("user_id", { count: "exact", head: true }),
    supabase.from("destination_categories").select("id", { count: "exact", head: true }),
    supabase.from("content_reports").select("id", { count: "exact", head: true }),
  ]) : null;
  const projectRef = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.split(".")[0];
  const studio = `https://supabase.com/dashboard/project/${projectRef}`;

  return <section className="section-shell pb-20 pt-10 lg:pt-14">
    <div className="relative overflow-hidden rounded-[2rem] bg-[#0b3644] px-7 py-10 text-white sm:px-10 lg:px-12">
      <div className="absolute -right-16 -top-20 size-72 rounded-full bg-[#1a797a]/45 blur-3xl" aria-hidden />
      <div className="absolute bottom-0 right-20 size-28 rotate-45 border border-white/15" aria-hidden />
      <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#bcf7e8]"><ShieldCheck size={15} /> TRAVELY ADMIN</span><h1 className="mt-5 font-serif text-4xl font-semibold sm:text-5xl">Your control room</h1><p className="mt-3 max-w-2xl leading-7 text-white/75">Manage your community, respond to reports, and keep the destination catalogue current—all from one place.</p></div><Link href="/journal" className="inline-flex items-center gap-2 text-sm font-semibold text-white/85 hover:text-white">View my portal <ArrowRight size={17} /></Link></div>
    </div>

    <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{stats.map(({ Icon, label, value, href }) => <Link key={label} href={href} className="group rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-lg"><div className="flex items-start justify-between"><span className="grid size-11 place-items-center rounded-2xl bg-[#e9f5f0] text-[#0d6d67]"><Icon size={22} /></span><ArrowRight size={17} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#0d6d67]" /></div><p className="mt-4 text-3xl font-bold text-[#123a50]">{value}</p><p className="mt-1 text-sm text-slate-600">{label}</p></Link>)}</div>

    <nav aria-label="Admin sections" className="mt-9 flex gap-2 overflow-x-auto border-b border-slate-200 pb-3">{tabs.map(({ id, label, Icon }) => <Link key={id} href={`/admin?tab=${id}`} aria-current={tab === id ? "page" : undefined} className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition ${tab === id ? "bg-[#0d6d67] text-white shadow-md" : "text-slate-600 hover:bg-white hover:text-[#0d6d67]"}`}><Icon size={17} /> {label}</Link>)}</nav>
    {params.error && <p role="alert" className="mt-6 rounded-2xl bg-red-50 p-4 text-red-700">{params.error}</p>}
    {params.message && <p role="status" className="mt-6 rounded-2xl bg-emerald-50 p-4 text-emerald-800">{params.message}</p>}

    {tab === "overview" && <div className="mt-9 grid gap-7 lg:grid-cols-[1.2fr_.8fr]">
      <div className={`${panel} relative overflow-hidden`}><div className="absolute right-0 top-0 h-36 w-36 rounded-bl-full bg-[#e9f5f0]" aria-hidden /><div className="relative"><p className="eyebrow">START HERE</p><h2 className="mt-2 font-serif text-3xl font-semibold text-[#123a50]">A simple daily checklist</h2><div className="mt-7 space-y-5">{[
        ["1", "Check new members", "See registered accounts and their most recent sign-in.", "/admin?tab=people"],
        ["2", "Review flagged stories", "Handle community reports with a clear status.", "/admin?tab=reports"],
        ["3", "Keep places fresh", "Add destinations and review the current catalogue.", "/admin?tab=destinations"],
      ].map(([number, title, detail, href]) => <Link key={number} href={href} className="group flex gap-4 rounded-2xl p-3 transition hover:bg-[#f3f8f6]"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#0d6d67] font-bold text-white">{number}</span><span><strong className="block text-[#123a50]">{title} <ArrowRight size={15} className="inline transition group-hover:translate-x-1" /></strong><span className="mt-1 block text-sm leading-6 text-slate-600">{detail}</span></span></Link>)}</div></div></div>
      <div className="space-y-7"><div className={panel}><div className="flex items-center justify-between"><h2 className="font-serif text-2xl font-semibold text-[#123a50]">Newest members</h2><Users className="text-[#0d6d67]" size={22} /></div>{peopleResult?.error ? <p className="mt-5 text-sm text-red-700">Could not load accounts: {peopleResult.error.message}</p> : people.length ? <div className="mt-5 divide-y divide-slate-100">{people.slice(0, 4).map((person) => <div key={person.id} className="py-3"><p className="font-semibold text-[#123a50]">{person.display_name || person.username || "Traveler"}</p><p className="text-xs text-slate-500">{person.email} · Last sign-in: {readableDate(person.last_sign_in_at)}</p></div>)}</div> : <p className="mt-5 text-sm text-slate-500">No members yet.</p>}<Link href="/admin?tab=people" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#0d6d67]">Manage people <ArrowRight size={16} /></Link></div><div className="rounded-[1.75rem] bg-[#fff4e9] p-6"><h2 className="font-serif text-2xl font-semibold text-[#783d20]">Before public launch</h2><p className="mt-2 text-sm leading-6 text-[#785641]">Email confirmation is currently off for easier testing. Turn it back on in Supabase Auth and enable leaked-password protection before opening sign-ups to the public.</p><a href={`${studio}/auth/providers`} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#9b4f2b]">Open Auth settings <ExternalLink size={15} /></a></div></div>
    </div>}

    {tab === "people" && <div className="mt-9 space-y-6"><div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">MEMBERS & PERMISSIONS</p><h2 className="mt-2 font-serif text-3xl font-semibold text-[#123a50]">People who joined</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">See account details and the latest successful sign-in. To make someone an admin, they must first create a TRAVELY account; then search for their email and choose Make admin.</p></div><span className="rounded-full bg-[#e9f5f0] px-4 py-2 text-sm font-semibold text-[#0d6d67]">{userCount.count ?? 0} total accounts</span></div>
      <form action="/admin" method="get" className="flex flex-col gap-3 sm:flex-row"><input type="hidden" name="tab" value="people" /><div className="relative flex-1"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><Input name="q" aria-label="Search members" placeholder="Search name, username, or email" defaultValue={search} maxLength={120} className="pl-11" /></div><Button type="submit">Search members</Button></form>
      {peopleResult?.error && <p role="alert" className="rounded-2xl bg-red-50 p-4 text-red-700">Could not load members: {peopleResult.error.message}</p>}
      {!peopleResult?.error && <AdminPeople people={people} currentUserId={user.id} />}
      <div className="flex items-center justify-between text-sm text-slate-600"><p>{peopleTotal ? `Showing ${(page - 1) * 25 + 1}–${(page - 1) * 25 + people.length} of ${peopleTotal} matches` : "No matching accounts"}</p><div className="flex gap-2">{page > 1 && <Link href={`/admin?tab=people&q=${encodeURIComponent(search)}&page=${page - 1}`} className={buttonClasses({ variant: "outline", size: "sm" })}>Previous</Link>}{page * 25 < peopleTotal && <Link href={`/admin?tab=people&q=${encodeURIComponent(search)}&page=${page + 1}`} className={buttonClasses({ variant: "outline", size: "sm" })}>Next</Link>}</div></div>
      <p className="rounded-2xl bg-[#eff7f4] p-4 text-sm leading-6 text-[#225957]">For security, this page shows a member’s <strong>last sign-in</strong>, not a full login-event history. Open Supabase Authentication to inspect account records and audit logs.</p>
    </div>}

    {tab === "reports" && <div className="mt-9"><p className="eyebrow">COMMUNITY SAFETY</p><h2 className="mt-2 font-serif text-3xl font-semibold text-[#123a50]">Story reports</h2><p className="mt-2 text-sm text-slate-600">Review a flagged story before changing its status. The latest 100 reports appear here.</p>{reportsResult?.error && <p role="alert" className="mt-5 text-red-700">{reportsResult.error.message}</p>}{reports.length ? <div className="mt-7 space-y-4">{reports.map((report) => { const memory = memoryById.get(report.memory_id); const reporter = reporterById.get(report.reporter_id); return <article key={report.id} className={panel}><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${report.status === "open" ? "bg-orange-100 text-orange-800" : "bg-slate-100 text-slate-700"}`}>{report.status}</span><h3 className="mt-3 font-serif text-2xl font-semibold text-[#123a50]">{memory?.title ?? "Story unavailable"}</h3><p className="mt-1 text-sm text-slate-500">{memory?.destination_name ?? "Unknown destination"} · Reported by {reporter?.display_name ?? "Member"} · {readableDate(report.created_at)}</p><p className="mt-4 max-w-3xl rounded-xl bg-[#f8faf9] p-4 leading-6 text-slate-700">{report.reason}</p></div>{memory && <Link href={`/memories/${memory.id}`} className={buttonClasses({ variant: "outline", size: "sm" })}>View story <ArrowRight size={15} /></Link>}</div><form action={updateReportStatus} className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-5"><input type="hidden" name="id" value={report.id} /><label htmlFor={`status-${report.id}`} className="mr-2 text-sm font-semibold text-slate-700">Status</label><select id={`status-${report.id}`} name="status" defaultValue={report.status} className="min-h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm"><option value="open">Open</option><option value="reviewing">Reviewing</option><option value="resolved">Resolved</option><option value="dismissed">Dismissed</option></select><Button type="submit" variant="outline" size="sm">Save status</Button></form></article>; })}</div> : !reportsResult?.error && <div className="mt-7 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center"><Flag className="mx-auto text-[#0d6d67]" size={30} /><h3 className="mt-3 font-serif text-2xl font-semibold text-[#123a50]">No reports yet</h3><p className="mt-2 text-slate-600">Community reports will appear here when members flag a story.</p></div>}</div>}

    {tab === "destinations" && <div className="mt-9 grid gap-8 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]"><div><p className="eyebrow">GROW THE MAP</p><h2 className="mt-2 font-serif text-3xl font-semibold text-[#123a50]">Add a destination</h2><form action={createDestination} className="mt-5 space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div><Label htmlFor="name">Name</Label><Input id="name" name="name" required maxLength={120} /></div><div><Label htmlFor="slug">URL slug</Label><Input id="slug" name="slug" required pattern="[a-z0-9-]+" placeholder="my-destination" /></div><div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="country">Country</Label><Input id="country" name="country" required defaultValue="India" maxLength={80} /></div><div><Label htmlFor="region">Region</Label><Input id="region" name="region" /></div></div><div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="latitude">Latitude</Label><Input id="latitude" name="latitude" type="number" step="any" min={-90} max={90} /></div><div><Label htmlFor="longitude">Longitude</Label><Input id="longitude" name="longitude" type="number" step="any" min={-180} max={180} /></div></div><div><Label htmlFor="coverImageUrl">Cover image URL</Label><Input id="coverImageUrl" name="coverImageUrl" type="url" /></div><div><Label htmlFor="description">Description</Label><Textarea id="description" name="description" required minLength={20} /></div><Button type="submit"><Plus size={17} /> Add destination</Button></form></div><div><div className="flex items-end justify-between"><div><p className="eyebrow">CURRENT CATALOGUE</p><h2 className="mt-2 font-serif text-3xl font-semibold text-[#123a50]">All places</h2></div><span className="text-sm text-slate-500">{destinationCount.count ?? 0} places</span></div><div className="mt-5 max-h-[760px] overflow-y-auto"><AdminDestinations destinations={(destinationRows?.data as Destination[] | null) ?? []} /></div>{destinationRows?.error && <p role="alert" className="mt-3 text-red-700">{destinationRows.error.message}</p>}</div></div>}

    {tab === "database" && <div className="mt-9 space-y-7"><div><p className="eyebrow">YOUR DATA AT A GLANCE</p><h2 className="mt-2 font-serif text-3xl font-semibold text-[#123a50]">Database overview</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">A safe summary of live TRAVELY data. The full database, authentication records, and audit logs live in your private Supabase dashboard.</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{([
      ["Accounts", userCount.count ?? 0, Users], ["All stories", extraCounts?.[0].count ?? 0, BookOpen], ["Photos", extraCounts?.[1].count ?? 0, Images], ["Saved stories", extraCounts?.[2].count ?? 0, NotebookTabs], ["Categories", extraCounts?.[3].count ?? 0, MapIcon], ["Reports", extraCounts?.[4].count ?? 0, Flag],
    ] as const).map(([label, value, Icon]) => <div key={label} className={panel}><Icon className="text-[#0d6d67]" size={23} /><p className="mt-4 text-3xl font-bold text-[#123a50]">{value}</p><p className="text-sm text-slate-600">{label}</p></div>)}</div><div className={`${panel} grid gap-6 lg:grid-cols-[1fr_1fr]`}><div><h3 className="font-serif text-2xl font-semibold text-[#123a50]">Open in Supabase</h3><p className="mt-2 text-sm leading-6 text-slate-600">These links open your private project dashboard. Access is controlled by your Supabase account, separately from TRAVELY admin access.</p></div><div className="grid gap-3">{[["Accounts & sign-ins", `${studio}/auth/users`], ["Table editor", `${studio}/editor`], ["Storage & uploads", `${studio}/storage/files`], ["Auth audit logs", `${studio}/auth/audit-logs`]].map(([label, href]) => <a key={label} href={href} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-[#123a50] transition hover:border-teal-400 hover:bg-[#f1f8f5]">{label}<ExternalLink size={16} /></a>)}</div></div></div>}
  </section>;
}
