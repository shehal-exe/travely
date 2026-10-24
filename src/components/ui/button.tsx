import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

const styles = cva("inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d6d67]/45 disabled:pointer-events-none disabled:opacity-50", {
  variants: {
    variant: {
      primary: "bg-[#0d6d67] px-5 py-3 text-white shadow-lg shadow-[#082f3d]/15 hover:-translate-y-0.5 hover:bg-[#095b57]",
      secondary: "bg-white px-5 py-3 text-[#143b52] shadow-lg shadow-slate-950/10 hover:-translate-y-0.5",
      outline: "border border-slate-300 bg-white/70 px-5 py-3 text-slate-800 hover:border-[#0d6d67] hover:text-[#0d6d67]",
      ghost: "px-4 py-2 text-slate-700 hover:bg-slate-100",
      danger: "bg-red-600 px-5 py-3 text-white hover:bg-red-700",
    },
    size: { default: "min-h-11", sm: "min-h-9 px-3 py-2", lg: "min-h-12 px-7 py-3.5" },
  },
  defaultVariants: { variant: "primary", size: "default" },
});

export function Button({ className, variant, size, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof styles>) {
  return <button className={cn(styles({ variant, size }), className)} {...props} />;
}

export function buttonClasses(options?: VariantProps<typeof styles> & { className?: string }) {
  const { className, ...variants } = options ?? {};
  return cn(styles(variants), className);
}
