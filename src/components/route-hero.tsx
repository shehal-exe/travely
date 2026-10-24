"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function RouteHero({ images, children }: { images: string[]; children: React.ReactNode }) {
  const [active, setActive] = useState(0);
  useEffect(() => { const timer = window.setInterval(() => setActive((value) => (value + 1) % images.length), 4500); return () => window.clearInterval(timer); }, [images.length]);
  return <section className="relative isolate min-h-[68vh] overflow-hidden bg-[#0b3447] text-white">{images.map((image, index) => <Image key={image} src={image} alt="" fill priority={index === 0} className={`-z-20 object-cover transition-opacity duration-1000 ${active === index ? "opacity-100" : "opacity-0"}`} sizes="100vw" />)}<div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#061f2c] via-[#0b3447]/45 to-black/20" />{children}<div className="absolute bottom-7 right-8 flex gap-2">{images.map((image, index) => <button key={image} type="button" onClick={() => setActive(index)} aria-label={`Show route image ${index + 1}`} className={`h-1.5 rounded-full transition-all ${active === index ? "w-9 bg-emerald-200" : "w-5 bg-white/45"}`} />)}</div></section>;
}
