const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;

export interface DateRange { start: Date; end: Date; period: string }

function bangkokYearMonth(date: Date): { year: number; month: number } {
  const shifted = new Date(date.getTime() + BANGKOK_OFFSET_MS);
  return { year: shifted.getUTCFullYear(), month: shifted.getUTCMonth() + 1 };
}

export function bangkokMonthRange(date: Date, monthOffset = 0): DateRange {
  const { year, month } = bangkokYearMonth(date);
  const zeroBased = month - 1 + monthOffset;
  const start = new Date(Date.UTC(year, zeroBased, 1) - BANGKOK_OFFSET_MS);
  const end = new Date(Date.UTC(year, zeroBased + 1, 1) - BANGKOK_OFFSET_MS);
  const localStart = new Date(start.getTime() + BANGKOK_OFFSET_MS);
  const period = `${localStart.getUTCFullYear()}-${String(localStart.getUTCMonth() + 1).padStart(2, '0')}`;
  return { start, end, period };
}

export function bangkokPeriod(date: Date): string {
  const { year, month } = bangkokYearMonth(date);
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}
