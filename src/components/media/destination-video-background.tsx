"use client";

import { useReducedMotion } from "framer-motion";
import { useState } from "react";

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

  if (reduceMotion) {
    return <div className="absolute inset-0 -z-20 bg-[url('/videos/hero-poster.jpg')] bg-cover bg-center" aria-hidden />;
  }

  return (
    <video
      key={destinationVideos[activeVideo]}
      src={destinationVideos[activeVideo]}
      autoPlay
      muted
      playsInline
      preload="auto"
      poster="/videos/hero-poster.jpg"
      onTimeUpdate={(event) => {
        const video = event.currentTarget;
        const displayUntil = Math.min(video.duration || 11, 11);
        if (displayUntil - video.currentTime <= 0.45) {
          setActiveVideo((index) => (index + 1) % destinationVideos.length);
        }
      }}
      onEnded={() => setActiveVideo((index) => (index + 1) % destinationVideos.length)}
      className="absolute inset-0 -z-20 h-full w-full object-cover saturate-[1.1] contrast-[1.04]"
      aria-hidden
    />
  );
}
