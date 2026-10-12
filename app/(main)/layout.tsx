import { ReactNode } from "react";
import { QuickAddProvider } from "@/components/QuickAddProvider";
import { BottomNav } from "@/components/BottomNav";
import { QuickAddModalWrapper } from "@/components/QuickAddModalWrapper";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <QuickAddProvider>
      <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        <main className="w-full max-w-md mx-auto flex-1 flex flex-col relative pb-24 sm:shadow-sm sm:border-x sm:border-zinc-200/50 sm:dark:border-zinc-800/50 bg-white dark:bg-zinc-900">
          {children}
        </main>
        <BottomNav />
        <QuickAddModalWrapper />
      </div>
    </QuickAddProvider>
  );
}
