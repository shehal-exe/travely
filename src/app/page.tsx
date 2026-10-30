import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { DestinationCard } from "@/components/destination-card";
import { CoreFeaturePath } from "@/components/home/core-feature-path";
import { Hero } from "@/components/home/hero";
import { IndiaRoutes } from "@/components/home/india-routes";
import { MemoryCard } from "@/components/memory-card";
import { Reveal } from "@/components/motion/reveal";
import { categoryGuides } from "@/data/category-guides";
import { getFeaturedDestinations, getPublicMemories } from "@/lib/data";

const featuredSlugs = ["taj-mahal", "leh-ladakh", "goa"];

export default async function Home() {
  const [destinations, memories] = await Promise.all([getFeaturedDestinations(), getPublicMemories()]);
  const featured = featuredSlugs
    .map((slug) => destinations.find((item) => item.slug === slug))
    .filter((item) => item !== undefined);
  const places = featured.length === featuredSlugs.length ? featured : destinations.slice(0, 3);
  const moods = [
    { ...categoryGuides[1], image: "/images/travel/cherrapunji-3.jpg" },
    { ...categoryGuides[0], image: "/images/travel/goa-3.jpg" },
    { ...categoryGuides[2], image: "/images/travel/jaipur-2.jpg" },
  ];

  return (
    <>
      <Hero />
      <CoreFeaturePath />

      <section className="bg-[#f3f6f2] py-20 lg:py-28" aria-labelledby="places-heading">
        <div className="section-shell">
          <Reveal>
            <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Begin somewhere beautiful</p>
                <h2 id="places-heading" className="section-title mt-3 max-w-3xl font-serif font-semibold text-[#123a50]">
                  India, in its <em className="font-normal text-[#c95d38]">many colours.</em>
                </h2>
              </div>
              <Link href="/destinations" className="editorial-link text-[#0d6d67]">
                Explore every destination <ArrowUpRight size={17} aria-hidden />
              </Link>
            </div>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-3">
            {places.map((destination, index) => (
              <Reveal key={destination.id} delay={index * 0.08} direction={index === 0 ? "left" : index === places.length - 1 ? "right" : "up"}>
                <DestinationCard destination={destination} priority={index === 0} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <IndiaRoutes />

      <section className="section-shell py-20 lg:py-28" aria-labelledby="moods-heading">
        <Reveal>
          <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Start with a feeling</p>
              <h2 id="moods-heading" className="section-title mt-3 font-serif font-semibold text-[#123a50]">
                What <em className="font-normal text-[#c95d38]">calls you away?</em>
              </h2>
            </div>
            <Link href="/categories" className="editorial-link text-[#0d6d67]">
              All travel styles <ArrowUpRight size={17} aria-hidden />
            </Link>
          </div>
        </Reveal>
        <div className="grid gap-4 md:grid-cols-3">
          {moods.map((guide, index) => (
            <Reveal key={guide.name} delay={index * 0.08} direction={index === 0 ? "left" : index === moods.length - 1 ? "right" : "up"}>
              <Link
                href={`/destinations?category=${encodeURIComponent(guide.slug)}`}
                className="group relative isolate flex min-h-[360px] items-end overflow-hidden rounded-[1.15rem] bg-[#123a50] p-7 text-white"
              >
                <Image src={guide.image} alt="" fill className="-z-20 object-cover transition duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" />
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#071f2d]/90 via-[#071f2d]/20 to-transparent" />
                <div className="flex w-full items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[.18em] text-white/75">Explore by mood</p>
                    <h3 className="mt-2 font-serif text-3xl font-semibold">{guide.name}</h3>
                  </div>
                  <ArrowUpRight size={22} className="shrink-0 transition group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-[#dce4df] bg-white py-20 lg:py-28" aria-labelledby="stories-heading">
        <div className="section-shell">
          <Reveal>
            <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">From fellow travellers</p>
                <h2 id="stories-heading" className="section-title mt-3 font-serif font-semibold text-[#123a50]">
                  The story <em className="font-normal text-[#c95d38]">behind the place.</em>
                </h2>
              </div>
              <Link href="/explore" className="editorial-link text-[#0d6d67]">
                Explore community stories <ArrowUpRight size={17} aria-hidden />
              </Link>
            </div>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-2">
            {memories.slice(0, 2).map((memory, index) => (
              <Reveal key={memory.id} delay={index * 0.08} direction={index === 0 ? "left" : "right"}>
                <MemoryCard memory={memory} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell py-20 lg:py-28">
        <Reveal>
          <div className="group grid overflow-hidden rounded-[1.25rem] bg-[#0b3447] text-white shadow-[0_24px_70px_rgba(18,58,80,.14)] lg:grid-cols-2">
            <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
              <p className="text-xs font-semibold uppercase tracking-[.2em] text-emerald-200">When inspiration becomes a plan</p>
              <h2 className="mt-4 max-w-lg font-serif text-4xl font-semibold leading-tight sm:text-5xl">Make the journey your own.</h2>
              <p className="mt-5 max-w-md leading-7 text-white/75">
                Keep your places, route, budget, and notes together—without losing the joy of discovering what comes next.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Link href="/plan" className="inline-flex items-center gap-2 rounded-full bg-[#0d6d67] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#095b57]">
                  Plan a trip <ArrowRight size={17} aria-hidden />
                </Link>
                <Link href="/journal/new" className="text-sm font-semibold text-white/90 hover:underline">Share your journey</Link>
              </div>
            </div>
            <div className="relative min-h-[330px] lg:min-h-[480px]">
              <Image src="/images/travel/varanasi-1.jpg" alt="Morning light over the ghats of Varanasi" fill className="object-cover transition duration-1000 group-hover:scale-[1.04]" sizes="(max-width: 1024px) 100vw, 50vw" />
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
