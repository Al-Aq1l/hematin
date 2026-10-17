"use client";

import { useBalanceVisibility } from "@/components/BalanceVisibilityProvider";
import { formatRupiah } from "@/lib/money";
import { TrendingUp, TrendingDown, PiggyBank } from "lucide-react";

interface MonthlySummaryData {
  income: number;
  expense: number;
  saving: number;
}

export function CashFlowCards({ summary }: { summary: MonthlySummaryData }) {
  const { isHidden, isReady } = useBalanceVisibility();
  const hideSelisih = isReady && isHidden;

  const cards = [
    {
      label: "Masuk",
      icon: TrendingUp,
      value: formatRupiah(summary.income),
      badge: null,
    },
    {
      label: "Keluar",
      icon: TrendingDown,
      value: formatRupiah(summary.expense),
      badge: null,
    },
    {
      label: "Selisih",
      icon: PiggyBank,
      value: hideSelisih ? "••••••••" : formatRupiah(summary.saving, { showSign: true }),
      badge: hideSelisih
        ? null
        : summary.saving < 0
        ? "Defisit"
        : summary.saving > 0
        ? "Surplus"
        : null,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {cards.map(({ label, icon: Icon, value, badge }) => (
        <div key={label} className="p-3.5 rounded-2xl bg-white/[0.03] flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500 mb-2">
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
            {badge && <span className="ml-auto text-[9px] text-zinc-500">{badge}</span>}
          </div>
          <div className="text-xs sm:text-sm font-semibold font-mono tracking-tight text-zinc-100 truncate">
            {value}
          </div>
        </div>
      ))}
    </div>
  );
}
