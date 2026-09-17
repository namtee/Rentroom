import { prisma } from '../db';
import { addDays } from '../lib/time';

export async function createLeaseExpiryNotifications(now = new Date()): Promise<number> {
  const leases = await prisma.lease.findMany({
    where: { status: 'ACTIVE', endDate: { gte: now, lte: addDays(now, 30) } },
    include: { room: { select: { propertyId: true, number: true } } },
  });
  if (leases.length === 0) return 0;

  const hrefs = leases.map((lease) => `/leases/${lease.id}`);
  const existing = await prisma.notification.findMany({
    where: { type: 'LEASE_EXPIRING', href: { in: hrefs } },
    select: { propertyId: true, href: true },
  });
  const existingKeys = new Set(existing.map((item) => `${item.propertyId}:${item.href ?? ''}`));
  const notifications = leases.flatMap((lease) => {
    const href = `/leases/${lease.id}`;
    if (existingKeys.has(`${lease.room.propertyId}:${href}`)) return [];
    const days = Math.max(0, Math.ceil((lease.endDate.getTime() - now.getTime()) / 86_400_000));
    return [{
      propertyId: lease.room.propertyId,
      type: 'LEASE_EXPIRING' as const,
      title: 'ใกล้หมดสัญญาเช่า',
      body: `ห้อง ${lease.room.number} - เหลือ ${days} วัน`,
      href,
    }];
  });

  if (notifications.length === 0) return 0;
  const result = await prisma.notification.createMany({ data: notifications });
  return result.count;
}
