import Link from "next/link";
import { Camera, Compass, Play } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#092f42] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
        <div className="max-w-md">
          <div className="flex items-center gap-2 text-lg font-black tracking-[0.16em]"><Compass /> TRAVELY</div>
          <p className="mt-4 leading-7 text-slate-300">A thoughtful home for the places you visit, the stories you collect, and the journeys that inspire what comes next.</p>
        </div>
        <div>
          <h3 className="font-semibold">Explore</h3>
          <div className="mt-4 grid gap-3 text-sm text-slate-300"><Link href="/destinations">Destinations & map</Link><Link href="/destinations?view=routes">Route circuits</Link><Link href="/categories">Categories</Link><Link href="/explore">Travel blogs</Link><Link href="/gallery">Gallery</Link></div>
        </div>
        <div>
          <h3 className="font-semibold">Stay curious</h3>
          <div className="mt-4 flex gap-3"><span className="grid size-10 place-items-center rounded-full bg-white/10"><Camera size={18} /></span><span className="grid size-10 place-items-center rounded-full bg-white/10"><Play size={18} /></span></div>
          <div className="mt-5 flex gap-4 text-xs text-slate-400"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/photo-credits">Photo credits</Link></div>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-slate-400">© 2026 TRAVELY. Explore. Experience. Remember.</div>
    </footer>
  );
}
