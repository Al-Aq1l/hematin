"use client";

import Link from "next/link";
import { Settings } from "lucide-react";
import { getGreetingWIB } from "@/lib/date";

interface HeaderProps {
  title?: string;
  showGreeting?: boolean;
  showSettings?: boolean;
}

export function Header({
  title,
  showGreeting = true,
  showSettings = true,
}: HeaderProps) {
  const greeting = getGreetingWIB();

  return (
    <header className="flex items-center justify-between px-5 pt-4 pb-2 sticky top-0 z-30 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div>
        {showGreeting ? (
          <div className="flex items-center gap-1.5">
            <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {greeting}
            </span>
            <span className="text-base">👋</span>
          </div>
        ) : (
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{title}</h1>
        )}
      </div>

      {showSettings && (
        <Link
          href="/settings"
          className="p-2.5 rounded-xl text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-colors"
          aria-label="Pengaturan"
        >
          <Settings className="w-5 h-5" />
        </Link>
      )}
    </header>
  );
}
