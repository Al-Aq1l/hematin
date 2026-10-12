import { ReactNode } from "react";
import { QuickAddProvider } from "@/components/QuickAddProvider";
import { BottomNav } from "@/components/BottomNav";
import { QuickAddModalWrapper } from "@/components/QuickAddModalWrapper";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <QuickAddProvider>
      <div className="min-h-screen flex flex-col bg-zinc-100 dark:bg-[#08090c] text-zinc-900 dark:text-zinc-100 antialiased selection:bg-emerald-500/30">
        <main className="w-full max-w-md mx-auto flex-1 flex flex-col relative pb-28 sm:shadow-2xl sm:border-x sm:border-zinc-200/50 sm:dark:border-zinc-800/80 bg-white dark:bg-[#0d1015]">
          {children}
        </main>
        <BottomNav />
        <QuickAddModalWrapper />
      </div>
    </QuickAddProvider>
  );
}
