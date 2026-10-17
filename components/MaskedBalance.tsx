"use client";

import { useBalanceVisibility } from "@/components/BalanceVisibilityProvider";
import { formatRupiah, MASKED_AMOUNT } from "@/lib/money";

interface MaskedBalanceProps {
  amount: number | bigint;
  options?: {
    prefix?: boolean;
    showSign?: boolean;
  };
  maskedText?: string;
  className?: string;
}

export function MaskedBalance({
  amount,
  options,
  maskedText = MASKED_AMOUNT,
  className,
}: MaskedBalanceProps) {
  const { isHidden, isReady } = useBalanceVisibility();

  if (isReady && isHidden) {
    return (
      <span className={className} aria-label="Saldo disembunyikan">
        {maskedText}
      </span>
    );
  }

  return (
    <span className={className}>
      {formatRupiah(amount, options)}
    </span>
  );
}
