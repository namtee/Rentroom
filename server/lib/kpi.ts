export function changePct(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export function occupancyPct(occupied: number, total: number): number {
  return total === 0 ? 0 : Math.round((occupied / total) * 100);
}
