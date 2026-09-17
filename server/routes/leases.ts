import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { HttpError } from '../lib/httpError';
import { bahtToSatang, satangToBaht } from '../lib/money';
import { assertCanManage, assertPropertyMember, currentUser, requireAuth } from '../middleware/auth';
import { idSchema, moneyBahtSchema, pagination, paginationSchema } from '../schemas';
import { notifyRoomAvailable } from '../services/notifications';

const router = Router({ mergeParams: true });
const paramsSchema = z.object({ propertyId: idSchema });
const listSchema = paginationSchema.extend({ status: z.enum(['ACTIVE', 'ENDED', 'CANCELLED']).optional() });
const createSchema = z.object({
  roomId: idSchema,
  tenantId: idSchema,
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  rent: moneyBahtSchema,
  deposit: moneyBahtSchema,
});
const updateSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  rent: moneyBahtSchema.optional(),
  deposit: moneyBahtSchema.optional(),
  status: z.enum(['ACTIVE', 'ENDED', 'CANCELLED']).optional(),
});

router.use(requireAuth);

router.get('/', async (req, res) => {
  const user = currentUser(req);
  const { propertyId } = paramsSchema.parse(req.params);
  await assertPropertyMember(user.id, propertyId);
  const query = listSchema.parse(req.query);
  const where = { room: { propertyId }, ...(query.status ? { status: query.status } : {}) };
  const [items, total] = await Promise.all([
    prisma.lease.findMany({ where, ...pagination(query.page, query.limit), orderBy: { startDate: 'desc' }, include: { room: true, tenant: true } }),
    prisma.lease.count({ where }),
  ]);
  res.json({
    items: items.map((lease) => ({ ...lease, rent: satangToBaht(lease.rent), deposit: satangToBaht(lease.deposit), room: { ...lease.room, monthlyRent: satangToBaht(lease.room.monthlyRent) } })),
    page: query.page,
    limit: query.limit,
    total,
  });
});

router.post('/', async (req, res) => {
  const user = currentUser(req);
  const { propertyId } = paramsSchema.parse(req.params);
  assertCanManage(await assertPropertyMember(user.id, propertyId));
  const input = createSchema.parse(req.body);
  if (input.endDate <= input.startDate) throw new HttpError(400, 'วันสิ้นสุดสัญญาต้องอยู่หลังวันเริ่มสัญญา', 'INVALID_LEASE_DATES');
  const [room, tenant, activeLease] = await Promise.all([
    prisma.room.findFirst({ where: { id: input.roomId, propertyId } }),
    prisma.tenant.findFirst({ where: { id: input.tenantId, propertyId } }),
    prisma.lease.findFirst({ where: { roomId: input.roomId, status: 'ACTIVE' }, select: { id: true } }),
  ]);
  if (!room) throw new HttpError(404, 'ไม่พบห้องพัก', 'ROOM_NOT_FOUND');
  if (!tenant) throw new HttpError(404, 'ไม่พบผู้เช่า', 'TENANT_NOT_FOUND');
  if (activeLease) throw new HttpError(409, 'ห้องนี้มีสัญญาเช่าที่ใช้งานอยู่แล้ว', 'ROOM_ALREADY_LEASED');
  const lease = await prisma.$transaction(async (tx) => {
    const created = await tx.lease.create({
      data: {
        roomId: input.roomId,
        tenantId: input.tenantId,
        startDate: input.startDate,
        endDate: input.endDate,
        rent: bahtToSatang(input.rent),
        deposit: bahtToSatang(input.deposit),
        status: 'ACTIVE',
      },
      include: { room: true, tenant: true },
    });
    await tx.room.update({ where: { id: input.roomId }, data: { status: 'OCCUPIED' } });
    return created;
  });
  res.status(201).json({
    ...lease,
    rent: satangToBaht(lease.rent),
    deposit: satangToBaht(lease.deposit),
    room: { ...lease.room, monthlyRent: satangToBaht(lease.room.monthlyRent) },
  });
});

router.get('/:leaseId', async (req, res) => {
  const user = currentUser(req);
  const { propertyId } = paramsSchema.parse(req.params);
  const leaseId = idSchema.parse(req.params.leaseId);
  await assertPropertyMember(user.id, propertyId);
  const lease = await prisma.lease.findFirst({ where: { id: leaseId, room: { propertyId } }, include: { room: true, tenant: true, payments: { orderBy: { period: 'desc' } } } });
  if (!lease) throw new HttpError(404, 'ไม่พบสัญญาเช่า', 'LEASE_NOT_FOUND');
  res.json({
    ...lease,
    rent: satangToBaht(lease.rent),
    deposit: satangToBaht(lease.deposit),
    room: { ...lease.room, monthlyRent: satangToBaht(lease.room.monthlyRent) },
    payments: lease.payments.map((p) => ({ ...p, amount: satangToBaht(p.amount) })),
  });
});

router.patch('/:leaseId', async (req, res) => {
  const user = currentUser(req);
  const { propertyId } = paramsSchema.parse(req.params);
  const leaseId = idSchema.parse(req.params.leaseId);
  assertCanManage(await assertPropertyMember(user.id, propertyId));
  const input = updateSchema.parse(req.body);
  const existing = await prisma.lease.findFirst({ where: { id: leaseId, room: { propertyId } }, include: { room: true } });
  if (!existing) throw new HttpError(404, 'ไม่พบสัญญาเช่า', 'LEASE_NOT_FOUND');
  const startDate = input.startDate ?? existing.startDate;
  const endDate = input.endDate ?? existing.endDate;
  if (endDate <= startDate) throw new HttpError(400, 'วันสิ้นสุดสัญญาต้องอยู่หลังวันเริ่มสัญญา', 'INVALID_LEASE_DATES');
  const lease = await prisma.$transaction(async (tx) => {
    if (input.status === 'ACTIVE' && existing.status !== 'ACTIVE') {
      const conflict = await tx.lease.findFirst({ where: { roomId: existing.roomId, status: 'ACTIVE', id: { not: leaseId } }, select: { id: true } });
      if (conflict) throw new HttpError(409, 'ห้องนี้มีสัญญาเช่าที่ใช้งานอยู่แล้ว', 'ROOM_ALREADY_LEASED');
    }
    const updated = await tx.lease.update({
      where: { id: leaseId },
      data: {
        ...input,
        ...(input.rent === undefined ? {} : { rent: bahtToSatang(input.rent) }),
        ...(input.deposit === undefined ? {} : { deposit: bahtToSatang(input.deposit) }),
      },
      include: { room: true, tenant: true },
    });
    if (updated.status === 'ACTIVE') {
      await tx.room.update({ where: { id: updated.roomId }, data: { status: 'OCCUPIED' } });
    } else if (existing.status === 'ACTIVE') {
      const another = await tx.lease.findFirst({ where: { roomId: updated.roomId, status: 'ACTIVE', id: { not: leaseId } }, select: { id: true } });
      if (!another) {
        const room = await tx.room.update({ where: { id: updated.roomId }, data: { status: 'VACANT' } });
        await notifyRoomAvailable(room, tx);
      }
    }
    return updated;
  });
  res.json({
    ...lease,
    rent: satangToBaht(lease.rent),
    deposit: satangToBaht(lease.deposit),
    room: { ...lease.room, monthlyRent: satangToBaht(lease.room.monthlyRent) },
  });
});

router.delete('/:leaseId', async (req, res) => {
  const user = currentUser(req);
  const { propertyId } = paramsSchema.parse(req.params);
  const leaseId = idSchema.parse(req.params.leaseId);
  assertCanManage(await assertPropertyMember(user.id, propertyId));
  const lease = await prisma.lease.findFirst({
    where: { id: leaseId, room: { propertyId } },
    include: { _count: { select: { payments: true } } },
  });
  if (!lease) throw new HttpError(404, 'ไม่พบสัญญาเช่า', 'LEASE_NOT_FOUND');
  if (lease.status !== 'CANCELLED' || lease._count.payments > 0) {
    throw new HttpError(409, 'ลบได้เฉพาะสัญญาที่ยกเลิกและยังไม่มีประวัติการชำระเงิน', 'LEASE_HAS_HISTORY');
  }
  await prisma.lease.delete({ where: { id: leaseId } });
  res.status(204).end();
});

export default router;
