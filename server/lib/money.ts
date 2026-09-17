export function satangToBaht(value: number): number {
  if (!Number.isInteger(value)) throw new TypeError('Money must be an integer number of satang');
  return Math.round(value / 100);
}

export function bahtToSatang(value: number): number {
  if (!Number.isInteger(value) || value < 0) throw new TypeError('Baht must be a non-negative integer');
  return value * 100;
}
