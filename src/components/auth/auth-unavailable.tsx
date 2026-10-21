import Link from "next/link";
import { Compass, Database } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

export function AuthUnavailable() {
  return (
    <div role="status" className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-6 text-amber-950">
      <div className="flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-[#0d6d67] shadow-sm"><Database size={21} /></span>
        <div>
          <h2 className="font-bold text-[#123a50]">Account features are in preview mode</h2>
          <p className="mt-2 text-sm leading-6 text-amber-900/80">Destination discovery, maps, routes, blogs, and galleries are ready to explore. Account creation and private journals will become available when the secure database connection is enabled.</p>
        </div>
      </div>
      <Link href="/destinations" className={buttonClasses({ className: "mt-6 w-full" })}>Explore destinations <Compass size={18} /></Link>
    </div>
  );
}
