"use client";

import { useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

const destinationVideos = [
  "/videos/taj-mahal.mp4",
  "/videos/munnar.mp4",
  "/videos/amritsar.mp4",
  "/videos/ladakh.mp4",
  "/videos/cherrapunji.mp4",
  "/videos/udaipur.mp4",
  "/videos/kerala.mp4",
  "/videos/rishikesh.mp4",
  "/videos/mumbai.mp4",
] as const;

export function DestinationVideoBackground() {
  const reduceMotion = useReducedMotion();
  const [activeVideo, setActiveVideo] = useState(0);
  const advancing = useRef(false);

  const advance = useCallback(() => {
    if (advancing.current) return;
    advancing.current = true;
    setActiveVideo((index) => (index + 1) % destinationVideos.length);
  }, []);

  useEffect(() => {
    advancing.current = false;
  }, [activeVideo]);

  if (reduceMotion) {
    return <div className="absolute inset-0 -z-20 bg-[url('/videos/hero-poster.jpg')] bg-cover bg-center" aria-hidden />;
  }

  const nextVideo = (activeVideo + 1) % destinationVideos.length;

  return <>
    <BufferedVideo key={destinationVideos[activeVideo]} src={destinationVideos[activeVideo]} active onAdvance={advance} />
    <BufferedVideo key={destinationVideos[nextVideo]} src={destinationVideos[nextVideo]} active={false} onAdvance={advance} />
  </>;
}

function BufferedVideo({ src, active, onAdvance }: { src: string; active: boolean; onAdvance: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (active) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [active, src]);

  return <video
    ref={videoRef}
    src={src}
    autoPlay={active}
    muted
    playsInline
    preload="auto"
    poster={active ? "/videos/hero-poster.jpg" : undefined}
    onTimeUpdate={active ? (event) => {
      const video = event.currentTarget;
      const displayUntil = Math.min(video.duration || 11, 11);
      if (displayUntil - video.currentTime <= 0.55) onAdvance();
    } : undefined}
    onEnded={active ? onAdvance : undefined}
    onError={active ? onAdvance : undefined}
    className={`absolute inset-0 -z-20 h-full w-full object-cover saturate-[1.1] contrast-[1.04] transition-opacity duration-300 ${active ? "opacity-100" : "opacity-0"}`}
    aria-hidden
  />;
}
