import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { HttpError } from '../lib/httpError';
import { assertCanManage, assertPropertyMember, currentUser, requireAuth } from '../middleware/auth';
import { idSchema, pagination, paginationSchema } from '../schemas';
import { createNotificationOnce } from '../services/notifications';

const router = Router({ mergeParams: true });
const paramsSchema = z.object({ propertyId: idSchema });
const listSchema = paginationSchema.extend({ status: z.enum(['PENDING', 'IN_PROGRESS', 'DONE', 'CANCELLED']).optional() });
const createSchema = z.object({ roomId: idSchema, title: z.string().trim().min(2).max(200) });
const updateSchema = z.object({ title: z.string().trim().min(2).max(200).optional(), status: z.enum(['PENDING', 'IN_PROGRESS', 'DONE', 'CANCELLED']).optional() });

router.use(requireAuth);

router.get('/', async (req, res) => {
  const user = currentUser(req);
  const { propertyId } = paramsSchema.parse(req.params);
  await assertPropertyMember(user.id, propertyId);
  const query = listSchema.parse(req.query);
  const where = { room: { propertyId }, ...(query.status ? { status: query.status } : {}) };
  const [items, total] = await Promise.all([
    prisma.maintenanceRequest.findMany({ where, ...pagination(query.page, query.limit), orderBy: { createdAt: 'desc' }, include: { room: true } }),
    prisma.maintenanceRequest.count({ where }),
  ]);
  res.json({ items, page: query.page, limit: query.limit, total });
});

router.post('/', async (req, res) => {
  const user = currentUser(req);
  const { propertyId } = paramsSchema.parse(req.params);
  assertCanManage(await assertPropertyMember(user.id, propertyId));
  const input = createSchema.parse(req.body);
  const room = await prisma.room.findFirst({ where: { id: input.roomId, propertyId } });
  if (!room) throw new HttpError(404, 'ไม่พบห้องพัก', 'ROOM_NOT_FOUND');
  const item = await prisma.$transaction(async (tx) => {
    const created = await tx.maintenanceRequest.create({ data: { roomId: input.roomId, title: input.title }, include: { room: true } });
    await createNotificationOnce({ propertyId, type: 'MAINTENANCE_NEW', title: 'มีแจ้งซ่อมใหม่', body: `ห้อง ${room.number} - ${input.title}`, href: `/maintenance/${created.id}` }, tx);
    return created;
  });
  res.status(201).json(item);
});

router.patch('/:maintenanceId', async (req, res) => {
  const user = currentUser(req);
  const { propertyId } = paramsSchema.parse(req.params);
  const maintenanceId = idSchema.parse(req.params.maintenanceId);
  assertCanManage(await assertPropertyMember(user.id, propertyId));
  const input = updateSchema.parse(req.body);
  const existing = await prisma.maintenanceRequest.findFirst({ where: { id: maintenanceId, room: { propertyId } }, select: { id: true } });
  if (!existing) throw new HttpError(404, 'ไม่พบรายการแจ้งซ่อม', 'MAINTENANCE_NOT_FOUND');
  res.json(await prisma.maintenanceRequest.update({ where: { id: maintenanceId }, data: input, include: { room: true } }));
});

router.delete('/:maintenanceId', async (req, res) => {
  const user = currentUser(req);
  const { propertyId } = paramsSchema.parse(req.params);
  const maintenanceId = idSchema.parse(req.params.maintenanceId);
  assertCanManage(await assertPropertyMember(user.id, propertyId));
  const existing = await prisma.maintenanceRequest.findFirst({ where: { id: maintenanceId, room: { propertyId } }, select: { id: true } });
  if (!existing) throw new HttpError(404, 'ไม่พบรายการแจ้งซ่อม', 'MAINTENANCE_NOT_FOUND');
  await prisma.maintenanceRequest.delete({ where: { id: maintenanceId } });
  res.status(204).end();
});

export default router;
