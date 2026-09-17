import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { HttpError } from '../lib/httpError';
import { assertPropertyMember, currentUser, requireAuth } from '../middleware/auth';
import { idSchema, pagination, paginationSchema } from '../schemas';

const router = Router({ mergeParams: true });
const paramsSchema = z.object({ propertyId: idSchema });
const listSchema = paginationSchema.extend({ unreadOnly: z.enum(['true', 'false']).optional() });

router.use(requireAuth);

router.get('/', async (req, res) => {
  const user = currentUser(req);
  const { propertyId } = paramsSchema.parse(req.params);
  await assertPropertyMember(user.id, propertyId);
  const query = listSchema.parse(req.query);
  const where = { propertyId, ...(query.unreadOnly === 'true' ? { readAt: null } : {}) };
  const [items, total, unread] = await Promise.all([
    prisma.notification.findMany({ where, ...pagination(query.page, query.limit), orderBy: { createdAt: 'desc' } }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { propertyId, readAt: null } }),
  ]);
  res.json({ items, unread, page: query.page, limit: query.limit, total });
});

router.patch('/:notificationId/read', async (req, res) => {
  const user = currentUser(req);
  const { propertyId } = paramsSchema.parse(req.params);
  const notificationId = idSchema.parse(req.params.notificationId);
  await assertPropertyMember(user.id, propertyId);
  const existing = await prisma.notification.findFirst({ where: { id: notificationId, propertyId }, select: { id: true } });
  if (!existing) throw new HttpError(404, 'ไม่พบการแจ้งเตือน', 'NOTIFICATION_NOT_FOUND');
  res.json(await prisma.notification.update({ where: { id: notificationId }, data: { readAt: new Date() } }));
});

router.post('/read-all', async (req, res) => {
  const user = currentUser(req);
  const { propertyId } = paramsSchema.parse(req.params);
  await assertPropertyMember(user.id, propertyId);
  const result = await prisma.notification.updateMany({ where: { propertyId, readAt: null }, data: { readAt: new Date() } });
  res.json({ updated: result.count });
});

export default router;
