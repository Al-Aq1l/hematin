"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useQuickAdd } from "./QuickAddProvider";

interface QuickAddModalProps {
  children?: React.ReactNode;
}

export function QuickAddModal({ children }: QuickAddModalProps) {
  const { isOpen, closeQuickAdd } = useQuickAdd();
  const sheetRef = useRef<HTMLDivElement>(null);

  // Close on ESC key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        closeQuickAdd();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeQuickAdd]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs backdrop-enter"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeQuickAdd();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-add-title"
    >
      <div
        ref={sheetRef}
        className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-3xl border-t border-zinc-200 dark:border-zinc-800 shadow-2xl px-5 pt-3 pb-[calc(2rem+env(safe-area-inset-bottom))] max-h-[90dvh] overflow-y-auto overscroll-contain sheet-enter flex flex-col"
      >
        {/* Drag handle */}
        <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-4" aria-hidden="true" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80 mb-4">
          <h2 id="quick-add-title" className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Catat Transaksi
          </h2>
          <button
            type="button"
            onClick={closeQuickAdd}
            className="p-2 -mr-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1">
          {children ? (
            children
          ) : (
            <div className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Form Quick Add siap dihubungkan pada Tahap 3.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
