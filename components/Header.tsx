"use client";

import Link from "next/link";
import { Search, Settings, ArrowLeft, User } from "lucide-react";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
  isDashboard?: boolean;
  showGreeting?: boolean;
  showSettings?: boolean;
}

export function Header({
  title,
  showBack = false,
  backHref = "/",
  isDashboard = false,
  showGreeting = false,
  showSettings = true,
}: HeaderProps) {
  // Dashboard Header: Default blank avatar, full search pill, and settings button
  if (isDashboard || showGreeting) {
    return (
      <header className="flex items-center gap-3 px-5 pt-3 pb-2 sticky top-0 z-30 bg-zinc-50/90 dark:bg-[#0d1015]/90 backdrop-blur-md">
        {/* Left: Default blank profile avatar with clear border & elevated background */}
        <Link
          href="/settings"
          className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-[#161a22] border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-300 hover:text-zinc-700 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700 hover:dark:bg-[#1c212b] transition-all shrink-0 shadow-xs dark:shadow-md dark:shadow-black/20"
          aria-label="Profil & Pengaturan"
          title="Pengaturan"
        >
          <User className="w-5 h-5 stroke-[1.75]" />
        </Link>

        {/* Center: Search Pill with high contrast */}
        <Link
          href="/transactions"
          className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-full bg-zinc-100 dark:bg-[#161a22] border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-300 text-xs hover:border-zinc-300 dark:hover:border-zinc-700 hover:dark:bg-[#1c212b] transition-all cursor-pointer shadow-xs dark:shadow-md dark:shadow-black/20"
          aria-label="Cari Transaksi"
        >
          <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-400 shrink-0" />
          <span className="font-medium text-zinc-400 dark:text-zinc-400">Search</span>
        </Link>

        {/* Right: Settings Icon */}
        {showSettings && (
          <Link
            href="/settings"
            className="p-2.5 rounded-full text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-[#161a22] transition-colors shrink-0"
            aria-label="Pengaturan"
            title="Pengaturan"
          >
            <Settings className="w-5 h-5" />
          </Link>
        )}
      </header>
    );
  }

  // Subpage Header with Title & Back Button
  return (
    <header className="flex items-center justify-between px-5 pt-3 pb-2 sticky top-0 z-30 bg-zinc-50/90 dark:bg-[#0d1015]/90 backdrop-blur-md">
      <div className="flex items-center gap-2.5">
        {showBack && (
          <Link
            href={backHref}
            className="p-1.5 -ml-1.5 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-colors"
            aria-label="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
        )}
        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{title}</h1>
      </div>

      {showSettings && (
        <Link
          href="/settings"
          className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-colors"
          aria-label="Pengaturan"
        >
          <Settings className="w-5 h-5" />
        </Link>
      )}
    </header>
  );
}
