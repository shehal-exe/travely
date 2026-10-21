import Image from "next/image";
import type { Metadata } from "next";
import { commonsCredits } from "@/lib/media-credits";

export const metadata: Metadata = { title: "Photo credits" };

const sections = [
  { prefix: "/images/travel/commons/destination/", title: "Destinations" },
  { prefix: "/images/travel/commons/gallery/", title: "Destination walkthroughs" },
  { prefix: "/images/travel/commons/category/", title: "Travel categories" },
  { prefix: "/images/travel/commons/story/", title: "Sample story gallery" },
];

export default function PhotoCreditsPage() {
  return <main className="section-shell py-16">
    <p className="eyebrow">Image attribution</p>
    <h1 className="mt-3 font-serif text-5xl font-semibold text-[#123a50]">Photo credits</h1>
    <p className="mt-5 max-w-3xl leading-7 text-slate-600">These place-specific photographs come from Wikimedia Commons. Each entry links to the original file and its licence. The site serves scaled copies without changing the original source files.</p>
    {sections.map((section) => <section key={section.prefix} className="mt-12">
      <h2 className="mb-5 font-serif text-3xl font-semibold text-[#123a50]">{section.title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(commonsCredits).filter(([image]) => image.startsWith(section.prefix)).map(([image, credit]) => <article key={image} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="relative aspect-[16/9]"><Image src={image} alt={credit.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, 33vw" /></div>
          <div className="space-y-2 p-4 text-sm text-slate-600"><h3 className="font-semibold text-[#123a50]">{credit.title}</h3><p>Photo: {credit.author}</p><div className="flex flex-wrap gap-x-4 gap-y-1 font-semibold text-[#0d6d67]"><a href={credit.source} target="_blank" rel="noreferrer">Original on Wikimedia Commons ↗</a>{credit.licenseUrl && <a href={credit.licenseUrl} target="_blank" rel="noreferrer">{credit.license} ↗</a>}</div></div>
        </article>)}
      </div>
    </section>)}
  </main>;
}
