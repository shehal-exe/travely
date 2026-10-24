import Link from "next/link";
import { ArrowRight, Camera, Compass, Heart } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { buttonClasses } from "@/components/ui/button";

const values = [
  { Icon: Camera, title: "Remember", text: "Preserve the feeling behind every photograph and keep the useful details close." },
  { Icon: Compass, title: "Discover", text: "Explore India through thoughtful destination records, maps, and real travel routes." },
  { Icon: Heart, title: "Connect", text: "Share useful stories with travellers while keeping private memories private." },
] as const;

export default function AboutPage() {
  return (
    <>
      <section id="about" className="relative isolate flex min-h-[590px] scroll-mt-24 items-center overflow-hidden bg-[#082f3d] text-white">
        <video autoPlay loop muted playsInline preload="metadata" aria-hidden className="absolute inset-0 -z-20 h-full w-full object-cover">
          <source src="/videos/about-india.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#061f35]/95 via-[#06453f]/75 to-[#082f3d]/30" />
        <div className="section-shell w-full py-24">
          <Reveal y={18}>
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-200">About TRAVELY</p>
              <h1 className="mt-4 font-serif text-5xl font-semibold leading-[1.08] sm:text-7xl">A meaningful home for the journeys that shape us.</h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/85">TRAVELY brings personal travel journaling and thoughtful discovery together—so a photograph becomes a story, and a story becomes someone else&apos;s inspiration.</p>
              <Link href="#contact" className={buttonClasses({ variant: "secondary", size: "lg", className: "mt-8" })}>Contact & collaborations <ArrowRight size={18} /></Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#eef5f2] py-20 lg:py-24" aria-labelledby="values-heading">
        <div className="section-shell">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="eyebrow">What brings us together</p>
              <h2 id="values-heading" className="mt-3 font-serif text-4xl font-semibold text-[#123a50] sm:text-5xl">Travel with meaning at every step.</h2>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {values.map(({ Icon, title, text }, index) => (
              <Reveal key={title} delay={index * 0.08}>
                <article className="min-h-64 rounded-[1.75rem] border border-[#dbe6e2] bg-white p-8 shadow-[0_18px_45px_rgba(18,58,80,.07)]">
                  <span className="grid size-14 place-items-center rounded-2xl bg-[#edf6f3] text-[#0d6d67]"><Icon size={25} /></span>
                  <h3 className="mt-6 font-serif text-2xl font-semibold text-[#123a50]">{title}</h3>
                  <p className="mt-3 leading-7 text-slate-600">{text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="relative isolate scroll-mt-24 overflow-hidden bg-[#082f3d] py-20 text-white">
        <div aria-hidden className="absolute -right-28 -top-36 size-96 rounded-full bg-[#0d6d67]/35 blur-3xl" />
        <div className="section-shell relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">Contact & collaborations</p>
            <h2 className="mt-3 max-w-3xl font-serif text-4xl font-semibold sm:text-5xl">Build the next journey with TRAVELY.</h2>
            <p className="mt-4 max-w-2xl leading-7 text-white/75">For partnerships, destination features, or editorial collaboration, start a profile and share the journey you want the community to discover.</p>
          </div>
          <Link href="/auth/sign-up" className={buttonClasses({ variant: "secondary", size: "lg" })}>Join TRAVELY <ArrowRight size={18} /></Link>
        </div>
      </section>
    </>
  );
}
