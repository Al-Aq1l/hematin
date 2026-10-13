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
  rightElement?: React.ReactNode;
  children?: React.ReactNode;
}

export function Header({
  title,
  showBack = false,
  backHref = "/",
  isDashboard = false,
  showGreeting = false,
  showSettings = true,
  rightElement,
  children,
}: HeaderProps) {
  // Dashboard Header: Default profile avatar, full search pill, and settings button
  if (isDashboard || showGreeting) {
    return (
      <header className="flex items-center gap-3 px-5 pt-4 pb-3 sticky top-0 z-30 bg-[#0d1015]/85 backdrop-blur-xl backdrop-saturate-150 border-b border-zinc-800/40">
        {/* Left: Default profile avatar */}
        <Link
          href="/settings"
          className="w-10 h-10 rounded-full bg-[#1a1f28]/90 backdrop-blur-sm border border-zinc-700/60 flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 transition-all shrink-0 shadow-sm"
          aria-label="Profil & Pengaturan"
          title="Pengaturan"
        >
          <User className="w-5 h-5 stroke-[1.75]" />
        </Link>

        {/* Center: Search Pill */}
        <Link
          href="/transactions"
          className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/80 dark:bg-[#1a1f28]/80 backdrop-blur-sm border border-zinc-200/60 dark:border-zinc-700/60 text-zinc-500 dark:text-zinc-400 text-[13px] hover:border-zinc-300 dark:hover:border-zinc-600 transition-all cursor-pointer shadow-sm"
          aria-label="Cari Transaksi"
        >
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <span className="font-medium">Search</span>
        </Link>

        {/* Right: Settings Icon */}
        {showSettings && (
          <Link
            href="/settings"
            className="p-2.5 rounded-full text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-200/40 dark:hover:bg-zinc-700/40 transition-colors shrink-0"
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
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#0d1015]/85 backdrop-blur-xl backdrop-saturate-150 border-b border-zinc-200/40 dark:border-zinc-800/40">
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-2.5">
          {showBack && (
            <Link
              href={backHref}
              className="p-1.5 -ml-1.5 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-200/40 dark:hover:bg-zinc-700/40 transition-colors"
              aria-label="Kembali"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
          )}
          <h1 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{title}</h1>
        </div>

        {rightElement ? (
          rightElement
        ) : showSettings ? (
          <Link
            href="/settings"
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/40 dark:hover:bg-zinc-700/40 transition-colors"
            aria-label="Pengaturan"
          >
            <Settings className="w-5 h-5" />
          </Link>
        ) : null}
      </div>

      {children && (
        <div className="px-5 pb-3">
          {children}
        </div>
      )}
    </header>
  );
}
