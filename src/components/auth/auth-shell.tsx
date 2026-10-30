import Image from "next/image";
import Link from "next/link";

export function AuthShell({ title, subtitle, children, alternate }: { title: string; subtitle: string; children: React.ReactNode; alternate: React.ReactNode }) {
  return (
    <section className="grid min-h-[calc(100vh-5rem)] lg:grid-cols-2">
      <div className="relative isolate hidden overflow-hidden p-12 text-white lg:flex lg:flex-col lg:justify-end"><Image src="/images/travel/ladakh-2.jpg" alt="Ladakh mountain landscape" fill priority className="-z-20 object-cover" sizes="50vw" /><div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#061f2c]/95 via-[#0b3447]/38 to-black/10" /><Link href="/" className="font-serif text-xl font-semibold tracking-[.16em]">TRAVELY</Link><blockquote className="mt-auto max-w-lg font-serif text-5xl leading-tight">“Every journey has a story worth remembering.”</blockquote><p className="mt-5 text-xs font-bold uppercase tracking-[.2em] text-emerald-200">India, at your own pace</p></div>
      <div className="paper-texture flex items-center justify-center px-5 py-16"><div className="w-full max-w-md"><p className="eyebrow">Welcome to TRAVELY</p><h1 className="mt-3 font-serif text-4xl font-semibold text-[#123a50]">{title}</h1><p className="mt-3 leading-7 text-slate-600">{subtitle}</p><div className="mt-8">{children}</div><div className="mt-7 text-center text-sm text-slate-600">{alternate}</div></div></div>
    </section>
  );
}
