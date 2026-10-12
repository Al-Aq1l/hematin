/**
 * Date and Time utilities tailored for Asia/Jakarta (WIB, UTC+7).
 * Source of truth: PRD v1.1 Section 8.5 & Section 15.1
 */

export const WIB_TIMEZONE = "Asia/Jakarta";
export const WIB_OFFSET_HOURS = 7;
export const WIB_OFFSET_MS = WIB_OFFSET_HOURS * 60 * 60 * 1000;

export const INDO_MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export const INDO_MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

const INDO_DAYS = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

/**
 * Returns year, month (1-12), day, hour, minute, second of a Date in WIB.
 */
export function getWIBComponents(date: Date = new Date()): {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
  second: number;
  dayOfWeek: number; // 0 (Sunday) to 6 (Saturday)
} {
  // Add 7 hours to UTC timestamp to get WIB local components
  const wibTime = new Date(date.getTime() + WIB_OFFSET_MS);
  return {
    year: wibTime.getUTCFullYear(),
    month: wibTime.getUTCMonth() + 1,
    day: wibTime.getUTCDate(),
    hour: wibTime.getUTCHours(),
    minute: wibTime.getUTCMinutes(),
    second: wibTime.getUTCSeconds(),
    dayOfWeek: wibTime.getUTCDay(),
  };
}

/**
 * Construct a UTC Date from WIB year, month (1-12), day, hour, min, sec, ms.
 */
export function createWIBDate(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  millisecond = 0
): Date {
  // Construct UTC time, then subtract 7 hours
  const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second, millisecond));
  return new Date(utcDate.getTime() - WIB_OFFSET_MS);
}

/**
 * Get the exact UTC start and end Date for a given month in WIB.
 * month is 1-12.
 */
export function getMonthRangeWIB(year: number, month: number): {
  start: Date;
  end: Date;
} {
  const start = createWIBDate(year, month, 1, 0, 0, 0, 0);
  // Next month day 0 gives last day of month
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const end = createWIBDate(year, month, lastDay, 23, 59, 59, 999);
  return { start, end };
}

/**
 * Get current year and month (1-12) in WIB.
 */
export function getCurrentYearMonthWIB(): { year: number; month: number } {
  const wib = getWIBComponents(new Date());
  return { year: wib.year, month: wib.month };
}

/**
 * Get previous calendar month in WIB.
 */
export function getPreviousYearMonthWIB(year: number, month: number): { year: number; month: number } {
  if (month === 1) return { year: year - 1, month: 12 };
  return { year, month: month - 1 };
}

/**
 * Get next calendar month in WIB.
 */
export function getNextYearMonthWIB(year: number, month: number): { year: number; month: number } {
  if (month === 12) return { year: year + 1, month: 1 };
  return { year, month: month + 1 };
}

/**
 * Get greeting based on WIB current hour.
 * PRD 9.1: "Sapaan singkat (sesuai waktu: pagi/siang/sore/malam)"
 */
export function getGreetingWIB(date: Date = new Date()): string {
  const { hour } = getWIBComponents(date);
  if (hour >= 4 && hour < 11) return "Selamat pagi";
  if (hour >= 11 && hour < 15) return "Selamat siang";
  if (hour >= 15 && hour < 18.5) return "Selamat sore";
  return "Selamat malam";
}

/**
 * Format a Date for Indonesian locale in WIB.
 * Example:
 * formatDateIndo(date, { withDay: true }) -> "Senin, 5 Oktober 2026"
 * formatDateIndo(date, { withTime: true }) -> "5 Okt 2026, 14:30"
 */
export function formatDateIndo(
  date: Date | string | number,
  options?: {
    withDay?: boolean;
    withTime?: boolean;
    shortMonth?: boolean;
  }
): string {
  const d = typeof date === "object" ? date : new Date(date);
  const wib = getWIBComponents(d);

  const monthName = options?.shortMonth
    ? INDO_MONTHS_SHORT[wib.month - 1]
    : INDO_MONTHS[wib.month - 1];

  let formatted = `${wib.day} ${monthName} ${wib.year}`;

  if (options?.withDay) {
    const dayName = INDO_DAYS[wib.dayOfWeek];
    formatted = `${dayName}, ${formatted}`;
  }

  if (options?.withTime) {
    const hh = String(wib.hour).padStart(2, "0");
    const mm = String(wib.minute).padStart(2, "0");
    formatted = `${formatted}, ${hh}:${mm}`;
  }

  return formatted;
}

/**
 * Format ISO date string YYYY-MM-DD for form input default in WIB.
 */
export function toWIBDateInputString(date: Date = new Date()): string {
  const wib = getWIBComponents(date);
  const yyyy = String(wib.year);
  const mm = String(wib.month).padStart(2, "0");
  const dd = String(wib.day).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Total days in a specific WIB month.
 */
export function getDaysInMonthWIB(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/**
 * Remaining days in current WIB month including today.
 */
export function getRemainingDaysInMonthWIB(date: Date = new Date()): number {
  const wib = getWIBComponents(date);
  const totalDays = getDaysInMonthWIB(wib.year, wib.month);
  return Math.max(1, totalDays - wib.day + 1);
}
