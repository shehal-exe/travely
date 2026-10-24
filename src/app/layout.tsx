import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { ScrollProgress } from "@/components/motion/scroll-progress";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "TRAVELY — Explore. Experience. Remember.", template: "%s | TRAVELY" },
  description: "Discover remarkable destinations, share authentic travel stories, and keep every journey close.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="antialiased" data-scroll-behavior="smooth">
      <body className="min-h-screen bg-background font-sans text-slate-900">
        <ScrollProgress />
        <Header />
        <main>{children}</main>
        <Footer />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
