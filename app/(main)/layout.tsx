import { ReactNode } from "react";
import { QuickAddProvider } from "@/components/QuickAddProvider";
import { BottomNav } from "@/components/BottomNav";
import { QuickAddModalWrapper } from "@/components/QuickAddModalWrapper";
import { Plasma } from "@/components/Plasma";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <QuickAddProvider>
      <div className="min-h-screen flex flex-col bg-zinc-100 dark:bg-[#08090c] text-zinc-900 dark:text-zinc-100 antialiased selection:bg-emerald-500/30">
        <main className="w-full max-w-md mx-auto flex-1 flex flex-col relative pb-28 sm:shadow-2xl sm:border-x sm:border-zinc-200/50 sm:dark:border-zinc-800/80 bg-zinc-50 dark:bg-[#0d1015] isolate overflow-hidden">
          <div className="absolute inset-0 -z-10 opacity-80 dark:opacity-100 pointer-events-none overflow-hidden">
            <Plasma color="#10b981" scale={2.6} quality={0.5} mouseInteractive={false} grain={0.02} />
          </div>
          {children}
        </main>
        <BottomNav />
        <QuickAddModalWrapper />
      </div>
    </QuickAddProvider>
  );
}
