import Link from "next/link";

export function AuthShell({ title, subtitle, children, alternate }: { title: string; subtitle: string; children: React.ReactNode; alternate: React.ReactNode }) {
  return (
    <section className="grid min-h-[calc(100vh-5rem)] lg:grid-cols-2">
      <div className="hidden bg-[linear-gradient(rgba(5,35,50,.48),rgba(5,35,50,.72)),url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=85')] bg-cover bg-center p-12 text-white lg:flex lg:flex-col lg:justify-end"><Link href="/" className="text-xl font-black tracking-[.16em]">TRAVELY</Link><blockquote className="mt-auto max-w-lg font-serif text-4xl leading-tight">“Every journey has a story worth remembering.”</blockquote></div>
      <div className="flex items-center justify-center px-5 py-16"><div className="w-full max-w-md"><p className="eyebrow">Welcome to TRAVELY</p><h1 className="mt-3 font-serif text-4xl font-semibold text-[#123a50]">{title}</h1><p className="mt-3 leading-7 text-slate-600">{subtitle}</p><div className="mt-8">{children}</div><div className="mt-7 text-center text-sm text-slate-600">{alternate}</div></div></div>
    </section>
  );
}
