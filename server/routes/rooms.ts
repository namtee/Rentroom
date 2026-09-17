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
const listSchema = paginationSchema.extend({
  status: z.enum(['OCCUPIED', 'VACANT']).optional(),
  search: z.string().trim().max(80).optional(),
});
const createSchema = z.object({
  number: z.string().trim().min(1).max(30),
  floor: z.coerce.number().int().min(-20).max(300),
  monthlyRent: moneyBahtSchema,
  status: z.enum(['OCCUPIED', 'VACANT']).default('VACANT'),
  coverImageUrl: z.string().url().nullable().optional(),
});
const updateSchema = createSchema.partial();

router.use(requireAuth);

router.get('/', async (req, res) => {
  const user = currentUser(req);
  const { propertyId } = paramsSchema.parse(req.params);
  await assertPropertyMember(user.id, propertyId);
  const query = listSchema.parse(req.query);
  const where = {
    propertyId,
    ...(query.status ? { status: query.status } : {}),
    ...(query.search ? { number: { contains: query.search, mode: 'insensitive' as const } } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.room.findMany({
      where,
      ...pagination(query.page, query.limit),
      orderBy: [{ floor: 'asc' }, { number: 'asc' }],
      include: { leases: { where: { status: 'ACTIVE' }, take: 1, include: { tenant: true } } },
    }),
    prisma.room.count({ where }),
  ]);
  res.json({
    items: items.map((room) => ({
      ...room,
      monthlyRent: satangToBaht(room.monthlyRent),
      leases: room.leases.map((lease) => ({
        ...lease,
        rent: satangToBaht(lease.rent),
        deposit: satangToBaht(lease.deposit),
      })),
    })),
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
  if (input.status === 'OCCUPIED') throw new HttpError(400, 'ห้องใหม่ต้องเริ่มเป็นห้องว่าง แล้วสร้างสัญญาเช่าเพื่อเปลี่ยนสถานะ', 'ROOM_STATUS_REQUIRES_LEASE');
  const room = await prisma.room.create({
    data: { ...input, propertyId, monthlyRent: bahtToSatang(input.monthlyRent) },
  });
  res.status(201).json({ ...room, monthlyRent: satangToBaht(room.monthlyRent) });
});

router.get('/:roomId', async (req, res) => {
  const user = currentUser(req);
  const { propertyId } = paramsSchema.parse(req.params);
  const roomId = idSchema.parse(req.params.roomId);
  await assertPropertyMember(user.id, propertyId);
  const room = await prisma.room.findFirst({
    where: { id: roomId, propertyId },
    include: {
      leases: { orderBy: { startDate: 'desc' }, include: { tenant: true, payments: { orderBy: { period: 'desc' }, take: 12 } } },
      maintenance: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!room) throw new HttpError(404, 'ไม่พบห้องพัก', 'ROOM_NOT_FOUND');
  res.json({
    ...room,
    monthlyRent: satangToBaht(room.monthlyRent),
    leases: room.leases.map((lease) => ({ ...lease, rent: satangToBaht(lease.rent), deposit: satangToBaht(lease.deposit), payments: lease.payments.map((payment) => ({ ...payment, amount: satangToBaht(payment.amount) })) })),
  });
});

router.patch('/:roomId', async (req, res) => {
  const user = currentUser(req);
  const { propertyId } = paramsSchema.parse(req.params);
  const roomId = idSchema.parse(req.params.roomId);
  assertCanManage(await assertPropertyMember(user.id, propertyId));
  const input = updateSchema.parse(req.body);
  const existing = await prisma.room.findFirst({ where: { id: roomId, propertyId } });
  if (!existing) throw new HttpError(404, 'ไม่พบห้องพัก', 'ROOM_NOT_FOUND');
  if (input.status) {
    const activeLease = await prisma.lease.findFirst({ where: { roomId, status: 'ACTIVE' }, select: { id: true } });
    if (input.status === 'VACANT' && activeLease) throw new HttpError(409, 'ห้องที่มีสัญญาเช่าใช้งานอยู่ไม่สามารถเปลี่ยนเป็นว่างได้', 'ACTIVE_LEASE_EXISTS');
    if (input.status === 'OCCUPIED' && !activeLease) throw new HttpError(409, 'ต้องมีสัญญาเช่าใช้งานอยู่ก่อนจึงจะเปลี่ยนห้องเป็นมีผู้เช่าได้', 'ACTIVE_LEASE_REQUIRED');
  }
  const room = await prisma.$transaction(async (tx) => {
    const updated = await tx.room.update({
      where: { id: roomId },
      data: { ...input, ...(input.monthlyRent === undefined ? {} : { monthlyRent: bahtToSatang(input.monthlyRent) }) },
    });
    if (existing.status !== 'VACANT' && updated.status === 'VACANT') await notifyRoomAvailable(updated, tx);
    return updated;
  });
  res.json({ ...room, monthlyRent: satangToBaht(room.monthlyRent) });
});

router.delete('/:roomId', async (req, res) => {
  const user = currentUser(req);
  const { propertyId } = paramsSchema.parse(req.params);
  const roomId = idSchema.parse(req.params.roomId);
  assertCanManage(await assertPropertyMember(user.id, propertyId));
  const room = await prisma.room.findFirst({
    where: { id: roomId, propertyId },
    include: { _count: { select: { leases: true, maintenance: true } } },
  });
  if (!room) throw new HttpError(404, 'ไม่พบห้องพัก', 'ROOM_NOT_FOUND');
  if (room._count.leases > 0 || room._count.maintenance > 0) {
    throw new HttpError(409, 'ไม่สามารถลบห้องที่มีประวัติสัญญาเช่าหรือแจ้งซ่อมได้', 'ROOM_HAS_HISTORY');
  }
  await prisma.room.delete({ where: { id: roomId } });
  res.status(204).end();
});

export default router;
