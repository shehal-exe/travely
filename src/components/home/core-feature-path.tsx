"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, MapPinned, ShieldCheck, Sparkles, WalletCards } from "lucide-react";

const journeySteps = [
  { number: "01", title: "Discover", description: "Find the right place through rich guides, travel styles, smart filters, and an interactive India map.", href: "/destinations", action: "Explore places", features: ["Destination guides", "Search & filters", "Interactive map"] },
  { number: "02", title: "Plan", description: "Turn inspiration into a practical trip with real circuits, budgets, saved places, and day-by-day planning.", href: "/plan", action: "Start planning", features: ["Ready-made routes", "Budget tracker", "Trip planner"] },
  { number: "03", title: "Share", description: "Publish photo-rich travel stories with trip duration, expenses, ratings, and useful notes for others.", href: "/explore", action: "Read stories", features: ["Traveller stories", "Photos & ratings", "Social discovery"] },
  { number: "04", title: "Remember", description: "Keep a personal travel journal, favourite places, photos, and every meaningful detail in one home.", href: "/journal", action: "Open your journal", features: ["Private journal", "Saved places", "Travel profile"] },
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
    <section className="paper-texture border-b border-[#dce4df] py-20 lg:py-28" aria-labelledby="journey-heading">
      <div className="section-shell">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24, filter: "blur(5px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-8 border-b border-[#dce4df] pb-12 lg:grid-cols-[1fr_.8fr] lg:items-end"
        >
          <div>
            <p className="eyebrow">One journey, one home</p>
            <h2 id="journey-heading" className="section-title mt-4 max-w-3xl font-serif font-semibold text-[#123a50]">
              Everything your trip needs, <em className="font-normal text-[#c95d38]">without the clutter.</em>
            </h2>
          </div>
          <div className="lg:pb-1">
            <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              TRAVELY keeps discovery, planning, community stories, and memories connected in one calm flow—from the first idea to the story you bring home.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {supportingFeatures.map(({ label, icon: Icon }, index) => (
                <motion.span
                  key={label}
                  initial={reduceMotion ? false : { opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: 0.16 + index * 0.06 }}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#29495a]"
                >
                  <Icon size={16} className="text-[#0d6d67]" aria-hidden /> {label}
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>

        <div>
          {journeySteps.map((step, index) => (
            <motion.article
              key={step.title}
              initial={reduceMotion ? false : { opacity: 0, x: index % 2 === 0 ? -18 : 18, y: 10, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, x: 0, y: 0, filter: "blur(0px)" }}
              whileHover={reduceMotion ? undefined : { x: 4 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.65, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="group grid gap-5 border-b border-[#dce4df] py-9 transition-colors hover:bg-white/45 md:grid-cols-[72px_.65fr_1.2fr_.75fr] md:items-start lg:py-11"
            >
              <span className="font-mono text-xs font-bold tracking-[.18em] text-[#c95d38] transition-transform group-hover:translate-x-1">{step.number}</span>
              <h3 className="font-serif text-3xl font-semibold text-[#123a50] transition-colors group-hover:text-[#0d6d67] sm:text-4xl">{step.title}</h3>
              <p className="max-w-xl leading-7 text-slate-600">{step.description}</p>
              <div className="md:text-right">
                <p className="text-[10px] font-bold uppercase leading-5 tracking-[.16em] text-slate-500">{step.features.join(" · ")}</p>
                <Link href={step.href} className="editorial-link mt-4 text-[#0d6d67]">
                  {step.action} <ArrowUpRight size={15} aria-hidden />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
