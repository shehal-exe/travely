import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0d6d67] focus:ring-4 focus:ring-teal-100", className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("min-h-36 w-full rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0d6d67] focus:ring-4 focus:ring-teal-100", className)} {...props} />;
}

export function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor: string }) {
  return <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold text-slate-700">{children}</label>;
}
