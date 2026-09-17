import type { NotificationType, Prisma, Room } from '@prisma/client';
import { prisma } from '../db';
import { satangToBaht } from '../lib/money';

type Db = Prisma.TransactionClient | typeof prisma;

export async function createNotificationOnce(input: {
  propertyId: string;
  type: NotificationType;
  title: string;
  body: string;
  href?: string;
  createdAt?: Date;
}, db: Db = prisma): Promise<void> {
  if (input.href) {
    const existing = await db.notification.findFirst({
      where: { propertyId: input.propertyId, type: input.type, href: input.href },
      select: { id: true },
    });
    if (existing) return;
  }
  await db.notification.create({ data: input });
}

export async function notifyRoomAvailable(room: Pick<Room, 'id' | 'propertyId' | 'number' | 'monthlyRent'>, db: Db = prisma): Promise<void> {
  await createNotificationOnce({
    propertyId: room.propertyId,
    type: 'ROOM_AVAILABLE',
    title: 'ห้องว่างพร้อมให้เช่า',
    body: `ห้อง ${room.number} - ${satangToBaht(room.monthlyRent).toLocaleString('en-US')} บาท/เดือน`,
    href: `/rooms/${room.id}?availableAt=${Date.now()}`,
  }, db);
}
