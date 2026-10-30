import Link from "next/link";
import { Camera, Compass, Play } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#082f3d] text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-[1.4fr_.7fr_.7fr] lg:px-8 lg:py-20">
        <div className="max-w-lg">
          <div className="flex items-center gap-3 font-serif text-xl font-semibold tracking-[0.16em]"><span className="grid size-10 place-items-center rounded-full border border-emerald-200/60"><Compass size={18} /></span> TRAVELY</div>
          <p className="mt-6 max-w-md font-serif text-3xl leading-tight text-white">A thoughtful home for every journey worth remembering.</p>
          <p className="mt-5 max-w-md leading-7 text-slate-300">Discover India, shape a practical route, share an honest story, and keep the memories that matter.</p>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[.2em] text-emerald-200">Explore</h3>
          <div className="mt-5 grid gap-3 text-sm text-slate-300"><Link href="/destinations">Destinations & map</Link><Link href="/destinations?view=routes">Route circuits</Link><Link href="/categories">Travel styles</Link><Link href="/explore">Travel stories</Link><Link href="/gallery">Gallery</Link></div>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[.2em] text-emerald-200">Make it yours</h3>
          <div className="mt-5 grid gap-3 text-sm text-slate-300"><Link href="/plan">Plan a trip</Link><Link href="/journal">Open your journal</Link><Link href="/about">About & contact</Link></div>
          <div className="mt-6 flex gap-3"><span className="grid size-10 place-items-center rounded-full border border-white/15"><Camera size={18} /></span><span className="grid size-10 place-items-center rounded-full border border-white/15"><Play size={18} /></span></div>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-white/10 px-5 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between lg:px-8"><span>© 2026 TRAVELY. Explore. Experience. Remember.</span><span className="flex gap-4"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/photo-credits">Photo credits</Link></span></div>
    </footer>
  );
}
