import { ReactNode } from "react";
import { QuickAddProvider } from "@/components/QuickAddProvider";
import { BottomNav } from "@/components/BottomNav";
import { QuickAddModalWrapper } from "@/components/QuickAddModalWrapper";
export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <QuickAddProvider>
      <div className="min-h-screen flex flex-col bg-[#08090c] text-zinc-100 antialiased selection:bg-zinc-700">
        <main className="w-full max-w-md mx-auto flex-1 flex flex-col relative pb-28 sm:shadow-2xl sm:border-x sm:border-zinc-800/80 bg-[#0d1015]">
          {children}
        </main>
        <BottomNav />
        <QuickAddModalWrapper />
      </div>
    </QuickAddProvider>
  );
}
