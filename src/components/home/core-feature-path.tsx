"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  ArrowUpRight,
  BookHeart,
  Compass,
  MapPinned,
  Route,
  ShieldCheck,
  Sparkles,
  UsersRound,
  WalletCards,
} from "lucide-react";

const journeySteps = [
  {
    number: "01",
    title: "Discover",
    description: "Find the right place through rich guides, travel styles, smart filters, and an interactive India map.",
    href: "/destinations",
    action: "Explore places",
    icon: Compass,
    features: ["Destination guides", "Search & filters", "Interactive map"],
    tone: "bg-[#eaf8f5] text-[#0d6d67]",
  },
  {
    number: "02",
    title: "Plan",
    description: "Turn inspiration into a practical trip with real circuits, budgets, saved places, and day-by-day planning.",
    href: "/plan",
    action: "Start planning",
    icon: Route,
    features: ["Ready-made routes", "Budget tracker", "Trip planner"],
    tone: "bg-[#e8f1f5] text-[#123a50]",
  },
  {
    number: "03",
    title: "Share",
    description: "Publish photo-rich travel stories with trip duration, expenses, ratings, and useful notes for others.",
    href: "/explore",
    action: "Read stories",
    icon: UsersRound,
    features: ["Traveller stories", "Photos & ratings", "Social discovery"],
    tone: "bg-[#edf6f3] text-[#0d6d67]",
  },
  {
    number: "04",
    title: "Remember",
    description: "Keep a personal travel journal, favourite places, photos, and every meaningful detail in one home.",
    href: "/journal",
    action: "Open your journal",
    icon: BookHeart,
    features: ["Private journal", "Saved places", "Travel profile"],
    tone: "bg-[#e9f0f3] text-[#123a50]",
  },
] as const;

const supportingFeatures = [
  { label: "Map every possibility", icon: MapPinned },
  { label: "Track a realistic budget", icon: WalletCards },
  { label: "Connect with travellers", icon: Sparkles },
  { label: "Safe community controls", icon: ShieldCheck },
] as const;

export function CoreFeaturePath() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-white py-20 lg:py-28" aria-labelledby="journey-heading">
      <div aria-hidden className="absolute -right-36 top-8 size-80 rounded-full bg-[#c9eee6]/45 blur-3xl" />
      <div aria-hidden className="absolute -left-40 bottom-0 size-80 rounded-full bg-[#dcebea]/55 blur-3xl" />

      <div className="section-shell relative">
        <div className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="eyebrow">One journey, one home</p>
            <h2 id="journey-heading" className="mt-3 max-w-xl font-serif text-4xl font-semibold leading-[1.08] text-[#123a50] sm:text-5xl">
              Everything your trip needs, without the clutter.
            </h2>
          </div>
          <div className="lg:pb-1">
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              TRAVELY keeps discovery, planning, community stories, and memories connected in one calm flow—from the first idea to the story you bring home.
            </p>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3">
              {supportingFeatures.map(({ label, icon: Icon }) => (
                <span key={label} className="inline-flex items-center gap-2 text-sm font-semibold text-[#29495a]">
                  <Icon size={16} className="text-[#0d6d67]" aria-hidden /> {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="relative mt-12">
          <div aria-hidden className="absolute left-[12.5%] right-[12.5%] top-8 hidden h-px bg-[#d7e4e3] lg:block">
            <motion.div
              className="h-full origin-left bg-[#0d6d67]"
              initial={reduceMotion ? false : { scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {journeySteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.article
                  key={step.title}
                  initial={reduceMotion ? false : { opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.24 }}
                  transition={{ duration: 0.65, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={reduceMotion ? undefined : { y: -7 }}
                  className="group relative flex min-h-[390px] flex-col rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-[0_18px_55px_rgba(18,58,80,.07)]"
                >
                  <div className="flex items-center justify-between">
                    <span className={`grid size-16 place-items-center rounded-2xl ${step.tone}`}>
                      <Icon size={27} strokeWidth={1.8} aria-hidden />
                    </span>
                    <span className="font-serif text-3xl font-semibold text-slate-200">{step.number}</span>
                  </div>
                  <h3 className="mt-7 font-serif text-3xl font-semibold text-[#123a50]">{step.title}</h3>
                  <p className="mt-3 leading-7 text-slate-600">{step.description}</p>
                  <ul className="mt-5 space-y-2" aria-label={`${step.title} features`}>
                    {step.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm font-semibold text-[#29495a]">
                        <span className="size-1.5 rounded-full bg-[#0d6d67]" aria-hidden /> {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href={step.href} className="mt-auto inline-flex items-center gap-2 pt-7 text-sm font-bold text-[#0d6d67] transition group-hover:gap-3">
                    {step.action} <ArrowUpRight size={17} aria-hidden />
                  </Link>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
