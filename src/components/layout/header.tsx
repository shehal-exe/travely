"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Compass, Menu, X } from "lucide-react";
import { signOut } from "@/actions/auth";
import { buttonClasses } from "@/components/ui/button";
import { getSupabaseBrowser } from "@/lib/supabase/client";

const links = [
  {
    label: "Discover",
    href: "/destinations",
    children: [
      ["All destinations", "/destinations"],
      ["Travel styles", "/categories"],
      ["Map", "/destinations?view=map"],
      ["Routes", "/destinations?view=routes"],
    ],
  },
  { label: "Plan", href: "/plan" },
  {
    label: "Stories",
    href: "/explore",
    children: [
      ["Travel stories", "/explore"],
      ["Photo gallery", "/gallery"],
      ["My journal", "/journal"],
      ["Saved inspiration", "/saved"],
    ],
  },
  { label: "About", href: "/about" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [account, setAccount] = useState({ signedIn: false, admin: false });
  const pathname = usePathname();

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

  return (
    <header className="sticky top-0 z-50 border-b border-[#e8e9e3] bg-[#fffdf8]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 text-lg font-black tracking-[0.14em] text-[#123a50]">
          <span className="grid size-9 place-items-center rounded-full bg-[#0d6d67] text-white"><Compass size={18} /></span>
          TRAVELY
        </Link>
        <nav className="hidden items-center gap-2 lg:flex" aria-label="Primary navigation">
          {links.map((item) => (
            <div key={item.label} className="group relative">
              <Link href={item.href} aria-current={pathname === item.href ? "page" : undefined} className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-[#314957] transition hover:bg-[#edf6f3] hover:text-[#0d6d67] aria-[current=page]:text-[#0d6d67]">
                {item.label}
                {"children" in item && <ChevronDown size={14} aria-hidden />}
              </Link>
              {"children" in item && (
                <div className="pointer-events-none invisible absolute left-0 top-full z-50 min-w-52 translate-y-2 pt-3 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                  <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10">
                    {item.children.map(([label, href]) => (
                      <Link key={href} href={href} className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-teal-50 hover:text-[#0d6d67]">{label}</Link>
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
      {open && (
        <nav className="border-t border-slate-100 bg-white px-5 py-5 lg:hidden" aria-label="Mobile navigation">
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            {links.map((item) => (
              <div key={item.label}>
                <Link href={item.href} onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 font-semibold text-slate-800 hover:bg-slate-50">{item.label}</Link>
                {"children" in item && (
                  <div className="ml-4 border-l border-slate-200 pl-2">
                    {item.children.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="block rounded-xl px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">{label}</Link>)}
                  </div>
                )}
              </div>
            ))}
            {account.signedIn ? <>
              {account.admin && <Link href="/admin" onClick={() => setOpen(false)} className="rounded-xl border border-slate-200 px-4 py-3 text-center font-semibold">Admin</Link>}
              <Link href="/journal" onClick={() => setOpen(false)} className="rounded-xl border border-slate-200 px-4 py-3 text-center font-semibold">My journal</Link>
              <form action={signOut}><button type="submit" className="w-full rounded-xl bg-[#e96536] px-4 py-3 text-center font-semibold text-white">Log out</button></form>
            </> : <>
              <Link href="/auth/login" onClick={() => setOpen(false)} className="mt-2 rounded-xl border border-slate-200 px-4 py-3 text-center font-semibold">Log in</Link>
              <Link href="/auth/sign-up" onClick={() => setOpen(false)} className="rounded-xl bg-[#e96536] px-4 py-3 text-center font-semibold text-white">Join TRAVELY</Link>
            </>}
          </div>
        </nav>
      )}
    </header>
  );
}
