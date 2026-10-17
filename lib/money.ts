/**
 * Utility functions for Rupiah money calculations and formatting.
 * Source of truth: PRD v1.1 Section 8.1
 * - Amounts stored as integer Rupiah (without decimals)
 * - Must be > 0 and <= 999.999.999.999
 * - Display format: "Rp4.250.000" (dot separator)
 */

export const MAX_TRANSACTION_AMOUNT = BigInt("999999999999");
export const MIN_TRANSACTION_AMOUNT = BigInt(1);

/**
 * Format a number or bigint into Indonesian Rupiah string.
 * Example:
 * 1000000 -> "Rp1.000.000"
 * -50000 -> "-Rp50.000"
 * prefix: false -> "1.000.000"
 */
export function formatRupiah(
  amount: number | bigint,
  options?: {
    prefix?: boolean;
    showSign?: boolean;
  }
): string {
  const { prefix = true, showSign = false } = options ?? {};
  const bigVal = typeof amount === "bigint" ? amount : BigInt(Math.round(amount));

  const isNegative = bigVal < BigInt(0);
  const absVal = isNegative ? -bigVal : bigVal;

  // Format with dots as thousands separator
  const formattedAbs = absVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  let signPrefix = "";
  if (isNegative) {
    signPrefix = "-";
  } else if (showSign && bigVal > BigInt(0)) {
    signPrefix = "+";
  }
  const currencyPrefix = prefix ? "Rp" : "";

  return `${signPrefix}${currencyPrefix}${formattedAbs}`;
}

export const MASKED_AMOUNT = "••••••••";

/**
 * Format an amount or return masked placeholder when hidden.
 */
export function formatMaskedRupiah(
  amount: number | bigint,
  isHidden: boolean,
  options?: {
    prefix?: boolean;
    showSign?: boolean;
    maskedText?: string;
  }
): string {
  if (isHidden) {
    return options?.maskedText ?? MASKED_AMOUNT;
  }
  return formatRupiah(amount, options);
}


/**
 * Clean user string input to raw numeric string or number.
 * Removes "Rp", spaces, dots, commas, negative signs.
 * Example: "Rp 1.500.000" -> 1500000
 */
export function parseRupiahInput(input: string): number {
  if (!input) return 0;
  const cleaned = input.replace(/[^0-9]/g, "");
  if (!cleaned) return 0;
  const parsed = Number(cleaned);
  return Number.isSafeInteger(parsed) ? parsed : 0;
}

/**
 * Convert number or string to BigInt Rupiah.
 */
export function toBigIntAmount(amount: number | string | bigint): bigint {
  if (typeof amount === "bigint") return amount;
  if (typeof amount === "string") {
    const parsed = parseRupiahInput(amount);
    return BigInt(parsed);
  }
  return BigInt(Math.round(amount));
}

/**
 * Convert BigInt to standard JavaScript number for JSON serialization.
 */
export function fromBigIntToNumber(amount: bigint | number | null | undefined): number {
  if (amount == null) return 0;
  if (typeof amount === "number") return amount;
  return Number(amount);
}

/**
 * Validate that an amount is a valid transaction amount.
 * Must be > 0 and <= MAX_TRANSACTION_AMOUNT.
 */
export function isValidTransactionAmount(amount: number | bigint | string): boolean {
  try {
    const big = toBigIntAmount(amount);
    return big >= MIN_TRANSACTION_AMOUNT && big <= MAX_TRANSACTION_AMOUNT;
  } catch {
    return false;
  }
}
