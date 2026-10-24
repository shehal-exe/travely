"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowRight, MapPin, Search } from "lucide-react";

const heroPoster = "/videos/hero-poster.jpg";

export function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const reduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, 64]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -24]);

  return (
    <section ref={heroRef} className="relative isolate min-h-[calc(100svh-76px)] overflow-hidden bg-[#0b3447] text-white">
      <motion.div className="pointer-events-none absolute -inset-10" style={reduceMotion ? undefined : { y: backgroundY }}>
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroPoster})` }} />
        {!reduceMotion && (
          <video
            className="absolute inset-0 size-full object-cover saturate-[1.12] contrast-[1.04]"
            src="/videos/about-india.mp4"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster={heroPoster}
            aria-hidden
          />
        )}
      </motion.div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,29,42,.94),rgba(5,35,50,.68)_55%,rgba(5,35,50,.2))]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#061f2d]/70 via-transparent to-transparent" />

      <div className="section-shell relative flex min-h-[calc(100svh-76px)] items-center py-14 lg:py-16">
        <div className="w-full">
          <motion.div style={reduceMotion ? undefined : { y: contentY }} className="max-w-3xl">
            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200"
            >
              <MapPin size={16} aria-hidden /> India, at your own pace
            </motion.p>
            <motion.h1
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="font-serif text-[2.8rem] font-semibold leading-[1.04] sm:text-6xl lg:text-[4.7rem]"
            >
              Discover India.<br /><em className="font-normal text-emerald-200">Make every mile yours.</em>
            </motion.h1>
            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.18 }}
              className="mt-6 max-w-2xl text-base leading-7 text-slate-100 sm:text-lg sm:leading-8"
            >
              Explore destination guides, interactive maps, ready-made routes, real trip budgets, and traveller stories—all in one place.
            </motion.p>
            <motion.form
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.26 }}
              onSubmit={(event) => { event.preventDefault(); const value = query.trim(); router.push(value ? `/destinations?q=${encodeURIComponent(value)}` : "/destinations"); }}
              className="mt-8 flex max-w-2xl flex-col gap-2 rounded-[1.25rem] border border-white/25 bg-white/95 p-2 shadow-2xl shadow-black/20 backdrop-blur sm:flex-row"
            >
              <label className="relative flex-1">
                <span className="sr-only">Search destinations</span>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0d6d67]" size={19} aria-hidden />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Goa, Ladakh, Varanasi…" className="min-h-12 w-full rounded-xl bg-transparent pl-12 pr-4 text-[#123a50] outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-[#0d6d67]/20" />
              </label>
              <button type="submit" className="min-h-12 rounded-xl bg-[#0d6d67] px-6 text-sm font-bold text-white transition hover:bg-[#095b57] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Find a place <ArrowRight size={17} className="ml-1 inline" aria-hidden /></button>
            </motion.form>
            <motion.div
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.38 }}
              className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-semibold text-white/90"
            >
              <Link href="/destinations" className="inline-flex items-center gap-1.5 hover:underline">Explore destinations <ArrowRight size={15} aria-hidden /></Link>
              <Link href="/destinations?view=routes" className="hover:underline">Browse routes</Link>
              <Link href="/explore" className="hover:underline">Read travel stories</Link>
            </motion.div>

          </motion.div>

        </div>
      </div>
    </section>
  );
}
