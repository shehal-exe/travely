"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const reduceMotion = useReducedMotion();
  const scaleX = useSpring(scrollYProgress, { stiffness: 130, damping: 28, mass: 0.25 });

  if (reduceMotion) return null;
  return <motion.div aria-hidden className="fixed inset-x-0 top-0 z-[70] h-1 origin-left bg-gradient-to-r from-[#123a50] to-[#0d6d67]" style={{ scaleX }} />;
}
