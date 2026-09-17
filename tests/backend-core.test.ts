import { describe, expect, it } from 'vitest';
import { changePct, occupancyPct } from '../server/lib/kpi';
import { signSession, verifySession } from '../server/lib/jwt';
import { bahtToSatang, satangToBaht } from '../server/lib/money';
import { bangkokMonthRange, bangkokPeriod } from '../server/lib/time';

describe('backend core helpers', () => {
  it('calculates KPI changes and occupancy', () => {
    expect(changePct(126500, 112900)).toBe(12);
    expect(changePct(52300, 49800)).toBe(5);
    expect(changePct(74200, 63100)).toBe(18);
    expect(changePct(10, 0)).toBeNull();
    expect(occupancyPct(42, 48)).toBe(88);
  });

  it('converts integer money without floats', () => {
    expect(bahtToSatang(3500)).toBe(350000);
    expect(satangToBaht(350000)).toBe(3500);
    expect(() => bahtToSatang(10.5)).toThrow();
  });

  it('uses Asia/Bangkok month boundaries', () => {
    const range = bangkokMonthRange(new Date('2025-09-11T13:12:00.000Z'));
    expect(range.period).toBe('2025-09');
    expect(range.start.toISOString()).toBe('2025-08-31T17:00:00.000Z');
    expect(range.end.toISOString()).toBe('2025-09-30T17:00:00.000Z');
    expect(bangkokPeriod(new Date('2025-08-31T18:00:00.000Z'))).toBe('2025-09');
  });

  it('signs, verifies, and expires sessions', () => {
    const secret = '12345678901234567890123456789012';
    const now = Date.parse('2025-09-11T13:12:00.000Z');
    const token = signSession({ id: 'u1', email: 'owner@example.test' }, secret, 60, now);
    expect(verifySession(token, secret, now + 30_000).sub).toBe('u1');
    expect(() => verifySession(token, secret, now + 61_000)).toThrow();
    expect(() => verifySession(`${token}x`, secret, now)).toThrow();
  });
});
