"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BookOpen, Bookmark, ChevronDown, Compass, Images, Map, MapPin, Menu, NotebookPen, Route, Shapes, X } from "lucide-react";
import { signOut } from "@/actions/auth";
import { buttonClasses } from "@/components/ui/button";
import { getSupabaseBrowser } from "@/lib/supabase/client";

const links = [
  {
    label: "Discover",
    href: "/destinations",
    children: [
      { label: "All destinations", href: "/destinations", Icon: MapPin },
      { label: "Travel styles", href: "/categories", Icon: Shapes },
      { label: "Explore map", href: "/destinations?view=map", Icon: Map },
      { label: "Travel routes", href: "/destinations?view=routes", Icon: Route },
    ],
  },
  { label: "Plan", href: "/plan" },
  {
    label: "Stories",
    href: "/explore",
    children: [
      { label: "Travel stories", href: "/explore", Icon: BookOpen },
      { label: "Photo gallery", href: "/gallery", Icon: Images },
      { label: "My journal", href: "/journal", Icon: NotebookPen },
      { label: "Saved inspiration", href: "/saved", Icon: Bookmark },
    ],
  },
  { label: "About", href: "/about" },
] as const;

const prefetchTargets = [...new Set(links.flatMap((item) => [item.href, ...("children" in item ? item.children.map((child) => child.href) : [])]))];

export function Header() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [account, setAccount] = useState({ signedIn: false, admin: false });
  const navigationTimer = useRef<number | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const warmupTimer = window.setTimeout(() => {
      prefetchTargets.forEach((href) => router.prefetch(href));
    }, 350);
    return () => window.clearTimeout(warmupTimer);
  }, [router]);

  useEffect(() => {
    let active = true;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    void supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        if (active) setAccount({ signedIn: false, admin: false });
        return;
      }
      const { data: role } = await supabase.from("user_roles")
        .select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
      if (active) setAccount({ signedIn: true, admin: Boolean(role) });
    });
    return () => { active = false; };
  }, [pathname]);

  function beginNavigation(href: string) {
    setOpen(false);
    if (typeof window !== "undefined" && `${window.location.pathname}${window.location.search}` === href) return;
    setNavigating(true);
    if (navigationTimer.current !== null) window.clearTimeout(navigationTimer.current);
    navigationTimer.current = window.setTimeout(() => setNavigating(false), 1600);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#dbe6e2] bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 text-lg font-black tracking-[0.14em] text-[#123a50]">
          <span className="grid size-9 place-items-center rounded-full bg-[#0d6d67] text-white"><Compass size={18} /></span>
          TRAVELY
        </Link>
        <nav className="hidden items-center gap-2 lg:flex" aria-label="Primary navigation">
          {links.map((item) => (
            <div key={item.label} className="group relative">
              <Link href={item.href} onClick={() => beginNavigation(item.href)} aria-current={pathname === item.href || ("children" in item && item.children.some((child) => pathname === child.href.split("?")[0])) ? "page" : undefined} aria-haspopup={"children" in item ? "menu" : undefined} className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-[#314957] transition hover:bg-[#edf6f3] hover:text-[#0d6d67] aria-[current=page]:bg-[#edf6f3] aria-[current=page]:text-[#0d6d67]">
                {item.label}
                {"children" in item && <ChevronDown size={14} aria-hidden />}
              </Link>
              {"children" in item && (
                <div className="pointer-events-none invisible absolute left-1/2 top-full z-50 w-80 -translate-x-1/2 translate-y-1 pt-2 opacity-0 transition duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                  <div role="menu" className="grid grid-cols-2 gap-1.5 rounded-[1.25rem] border border-slate-200/90 bg-white/98 p-2.5 shadow-xl shadow-slate-900/10 backdrop-blur-xl">
                    {item.children.map(({ label, href, Icon }) => (
                      <Link key={href} href={href} onClick={() => beginNavigation(href)} role="menuitem" className="group/item flex min-h-16 items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold leading-tight text-slate-700 transition hover:bg-[#edf6f3] hover:text-[#0d6d67] focus-visible:bg-[#edf6f3] focus-visible:text-[#0d6d67]">
                        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#edf6f3] text-[#0d6d67] transition group-hover/item:bg-white"><Icon size={17} /></span>
                        <span>{label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="hidden items-center gap-1 lg:flex">
          {account.signedIn ? <>
            {account.admin && <Link href="/admin" className={buttonClasses({ variant: "ghost" })}>Admin</Link>}
            <Link href="/journal" className={buttonClasses({ variant: "ghost" })}>My space</Link>
            <form action={signOut}><button type="submit" className={buttonClasses({ size: "sm" })}>Log out</button></form>
          </> : <>
            <Link href="/auth/login" className={buttonClasses({ variant: "ghost" })}>Log in</Link>
            <Link href="/auth/sign-up" className={buttonClasses({ size: "sm" })}>Join</Link>
          </>}
        </div>
        <button className="grid size-11 place-items-center rounded-full border border-slate-200 lg:hidden" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {navigating && <div role="status" aria-label="Opening page" className="absolute inset-x-0 bottom-0 h-1 overflow-hidden bg-[#dceae6]"><span className="block h-full w-1/3 bg-gradient-to-r from-[#123a50] to-[#0d6d67] motion-safe:animate-[nav-sweep_1s_ease-in-out_infinite]" /></div>}
      {open && (
        <nav className="border-t border-slate-100 bg-white px-5 py-5 lg:hidden" aria-label="Mobile navigation">
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            {links.map((item) => (
              <div key={item.label}>
                <Link href={item.href} onClick={() => beginNavigation(item.href)} className="block rounded-xl px-4 py-3 font-semibold text-slate-800 hover:bg-slate-50">{item.label}</Link>
                {"children" in item && (
                  <div className="grid grid-cols-2 gap-2 pb-2 pl-2">
                    {item.children.map(({ label, href, Icon }) => <Link key={href} href={href} onClick={() => beginNavigation(href)} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-[#edf6f3] hover:text-[#0d6d67]"><Icon size={16} />{label}</Link>)}
                  </div>
                )}
              </div>
            ))}
            {account.signedIn ? <>
              {account.admin && <Link href="/admin" onClick={() => setOpen(false)} className="rounded-xl border border-slate-200 px-4 py-3 text-center font-semibold">Admin</Link>}
              <Link href="/journal" onClick={() => setOpen(false)} className="rounded-xl border border-slate-200 px-4 py-3 text-center font-semibold">My journal</Link>
              <form action={signOut}><button type="submit" className="w-full rounded-xl bg-[#0d6d67] px-4 py-3 text-center font-semibold text-white">Log out</button></form>
            </> : <>
              <Link href="/auth/login" onClick={() => setOpen(false)} className="mt-2 rounded-xl border border-slate-200 px-4 py-3 text-center font-semibold">Log in</Link>
              <Link href="/auth/sign-up" onClick={() => setOpen(false)} className="rounded-xl bg-[#0d6d67] px-4 py-3 text-center font-semibold text-white">Join TRAVELY</Link>
            </>}
          </div>
        </nav>
      )}
    </header>
  );
}
