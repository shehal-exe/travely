"use client";

import { motion, useReducedMotion } from "framer-motion";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  direction?: "up" | "left" | "right" | "none";
  amount?: number;
};

export function Reveal({ children, className, delay = 0, y = 24, direction = "up", amount = 0.18 }: RevealProps) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <div className={className}>{children}</div>;

  const offset = {
    up: { x: 0, y },
    left: { x: -y, y: 0 },
    right: { x: y, y: 0 },
    none: { x: 0, y: 0 },
  }[direction];

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: offset.x, y: offset.y, scale: 0.985, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, amount, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.72, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
