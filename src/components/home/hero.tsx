"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, MapPin, Search } from "lucide-react";

const heroMedia = [
  {
    kind: "video",
    src: "/videos/taj-mahal.mp4",
    label: "Taj Mahal · Agra, Uttar Pradesh",
    credit: "Dr Photographer",
    page: "https://www.pexels.com/video/majestic-sunrise-over-historic-taj-mahal-33588459/",
  },
  {
    kind: "video",
    src: "/videos/munnar.mp4",
    label: "Tea-covered hills · Munnar, Kerala",
    credit: "Anil Sharma",
    page: "https://www.pexels.com/video/aerial-view-of-lush-green-hills-in-munnar-35440608/",
  },
  {
    kind: "video",
    src: "/videos/amritsar.mp4",
    label: "Golden Temple at sunset · Amritsar, Punjab",
    credit: "Shalender Kumar",
    page: "https://www.pexels.com/video/india-s-golden-temple-6576610/",
  },
  {
    kind: "video",
    src: "/videos/ladakh.mp4",
    label: "Snow mountains · Leh–Ladakh",
    credit: "Vipul Sharma",
    page: "https://www.pexels.com/video/4k-60fps-drone-shots-leh-ladakh-snow-mountains-18830352/",
  },
  {
    kind: "video",
    src: "/videos/cherrapunji.mp4",
    label: "Waterfall country · Cherrapunji, Meghalaya",
    credit: "Vikash Singh",
    page: "https://www.pexels.com/video/magnificent-falling-waterfall-in-lush-greenery-31696691/",
  },
  {
    kind: "video",
    src: "/videos/udaipur.mp4",
    label: "Lake Pichola · Udaipur, Rajasthan",
    credit: "Henil Patel",
    page: "https://www.pexels.com/video/scenic-view-of-lake-pichola-in-udaipur-37465315/",
  },
  {
    kind: "video",
    src: "/videos/kerala.mp4",
    label: "Emerald countryside · Kerala",
    credit: "Swagath Mohan",
    page: "https://www.pexels.com/video/aerial-view-of-lush-green-kerala-landscape-35000186/",
  },
  {
    kind: "video",
    src: "/videos/rishikesh.mp4",
    label: "Himalayan river valley · Rishikesh, Uttarakhand",
    credit: "Nitin Khajotia",
    page: "https://www.pexels.com/video/a-river-flowing-through-a-valley-surrounded-by-mountains-19096560/",
  },
  {
    kind: "video",
    src: "/videos/mumbai.mp4",
    label: "Gateway of India · Mumbai, Maharashtra",
    credit: "Yash Kanbargi",
    page: "https://www.pexels.com/video/gate-way-of-india-28002608/",
  },
] as const;

const heroPoster = "/videos/hero-poster.jpg";

export function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const reduceMotion = useReducedMotion();
  const [activeVideo, setActiveVideo] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, 64]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -24]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const transitionTimer = useRef<number | null>(null);
  const isTransitioning = useRef(false);
  const media = heroMedia[activeVideo];

  useEffect(() => {
    return () => {
      if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current);
    };
  }, []);

  function keepPlaying(index: number) {
    const current = videoRefs.current[index];
    if (!current || index !== activeVideo || reduceMotion) return;
    current.currentTime = 0;
    void current.play();
  }

  function advanceVideo(index: number) {
    if (index !== activeVideo || isTransitioning.current || reduceMotion) return;

    const current = videoRefs.current[index];
    const nextIndex = (index + 1) % heroMedia.length;
    const next = videoRefs.current[nextIndex];

    if (!current) return;

    if (!next || next.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) {
      if (current?.ended) keepPlaying(index);
      return;
    }

    isTransitioning.current = true;
    const showNext = () => {
      setActiveVideo(nextIndex);
      transitionTimer.current = window.setTimeout(() => {
        current.pause();
        current.currentTime = 0;
        isTransitioning.current = false;
      }, 1100);
    };

    next.currentTime = 0;
    void next.play().then(showNext).catch(() => {
      isTransitioning.current = false;
      keepPlaying(index);
    });
  }

  function selectVideo(nextIndex: number) {
    if (nextIndex === activeVideo || reduceMotion || isTransitioning.current) return;

    const current = videoRefs.current[activeVideo];
    const next = videoRefs.current[nextIndex];
    if (!next) return;

    if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current);
    isTransitioning.current = true;
    next.currentTime = 0;
    void next.play().then(() => {
      setActiveVideo(nextIndex);
      transitionTimer.current = window.setTimeout(() => {
        if (current) {
          current.pause();
          current.currentTime = 0;
        }
        isTransitioning.current = false;
      }, 1100);
    }).catch(() => {
      isTransitioning.current = false;
    });
  }

  return (
    <section ref={heroRef} className="relative isolate min-h-[calc(100svh-76px)] overflow-hidden bg-[#0b3447] text-white">
      <motion.div className="pointer-events-none absolute -inset-10" style={reduceMotion ? undefined : { y: backgroundY }}>
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroPoster})` }} />
        {!reduceMotion && heroMedia.map((item, index) => (
          <video
            key={item.src}
            ref={(element) => { videoRefs.current[index] = element; }}
            className={`absolute inset-0 size-full object-cover saturate-[1.12] contrast-[1.04] transition-opacity duration-1000 ${index === activeVideo ? "opacity-100" : "opacity-0"}`}
            src={item.src}
            autoPlay={index === 0}
            muted
            playsInline
            preload={index === activeVideo || index === (activeVideo + 1) % heroMedia.length ? "auto" : "none"}
            poster={index === 0 ? heroPoster : undefined}
            onCanPlay={() => { if (index === activeVideo && videoRefs.current[index]?.paused) void videoRefs.current[index]?.play(); }}
            onTimeUpdate={(event) => {
              const element = event.currentTarget;
              const displayUntil = Math.min(element.duration, 11);
              if (displayUntil - element.currentTime <= 1.25) advanceVideo(index);
            }}
            onEnded={() => keepPlaying(index)}
            aria-hidden
          />
        ))}
      </motion.div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,29,42,.94),rgba(5,35,50,.68)_55%,rgba(5,35,50,.2))]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#061f2d]/70 via-transparent to-transparent" />

      <div className="section-shell relative flex min-h-[calc(100svh-76px)] items-center py-14 lg:py-16">
        <div className="grid w-full items-center gap-12 xl:grid-cols-[1fr_360px]">
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
              Discover India.<br /><em className="font-normal text-orange-300">Make every mile yours.</em>
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
              <button type="submit" className="min-h-12 rounded-xl bg-[#e96536] px-6 text-sm font-bold text-white transition hover:bg-[#d9562b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Find a place <ArrowRight size={17} className="ml-1 inline" aria-hidden /></button>
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

            {!reduceMotion && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-9 flex items-center gap-3"
                aria-label="Choose background destination"
              >
                <span className="mr-1 text-[11px] font-bold uppercase tracking-[.16em] text-white/65">Across India</span>
                {heroMedia.map((item, index) => (
                  <button
                    key={item.src}
                    type="button"
                    onClick={() => selectVideo(index)}
                    aria-label={`Show ${item.label}`}
                    aria-pressed={index === activeVideo}
                    className={`h-1.5 rounded-full transition-all duration-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${index === activeVideo ? "w-9 bg-orange-300" : "w-2.5 bg-white/45 hover:bg-white/80"}`}
                  />
                ))}
              </motion.div>
            )}
          </motion.div>

          <motion.aside
            initial={reduceMotion ? false : { opacity: 0, x: 34 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="hidden rounded-[1.75rem] border border-white/20 bg-[#062939]/55 p-6 shadow-2xl shadow-black/15 backdrop-blur-md xl:block"
            aria-label="TRAVELY journey"
          >
            <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-200">Your journey, connected</p>
            <div className="mt-6 space-y-1">
              {["Discover a place", "Shape a route", "Share the experience", "Keep the memory"].map((step, index) => (
                <div key={step} className="group flex items-center gap-4 rounded-2xl p-3 transition hover:bg-white/10">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full border border-white/25 bg-white/10 font-serif text-sm text-orange-200">0{index + 1}</span>
                  <span className="font-semibold text-white/90">{step}</span>
                </div>
              ))}
            </div>
            <p className="mt-5 border-t border-white/15 pt-5 text-sm leading-6 text-white/65">From first spark to lasting story—move through every stage without losing your place.</p>
          </motion.aside>
        </div>
      </div>
      <a
        href={media.page}
        target="_blank"
        rel="noreferrer"
        className="absolute bottom-6 right-8 hidden rounded-2xl border border-white/20 bg-black/30 px-4 py-3 text-xs text-white/85 backdrop-blur transition hover:bg-black/50 md:block"
      >
        {media.label} · Video by {media.credit} / Pexels
      </a>
    </section>
  );
}
