import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { assertCanManage, assertPropertyMember, currentUser, requireAuth } from '../middleware/auth';
import { idSchema } from '../schemas';
import { HttpError } from '../lib/httpError';

const router = Router();
const createSchema = z.object({
  name: z.string().trim().min(2).max(120),
  type: z.enum(['CONDO', 'ROOM_RENTAL', 'APARTMENT', 'DORMITORY', 'COMMERCIAL', 'OTHER']).default('CONDO'),
  typeLabel: z.string().trim().min(1).max(60).nullable().optional(),
});
const updateSchema = createSchema.partial();

router.use(requireAuth);

router.get('/', async (req, res) => {
  const user = currentUser(req);
  const memberships = await prisma.propertyMember.findMany({
    where: { userId: user.id },
    include: { property: { include: { _count: { select: { rooms: true, tenants: true } } } } },
    orderBy: { property: { name: 'asc' } },
  });
  res.json(memberships.map(({ property, role }) => ({ ...property, role })));
});

router.post('/', async (req, res) => {
  const user = currentUser(req);
  const input = createSchema.parse(req.body);
  const property = await prisma.property.create({
    data: {
      ...input,
      plan: 'FREE',
      members: { create: { userId: user.id, role: 'OWNER' } },
    },
  });
  res.status(201).json(property);
});

router.get('/:propertyId', async (req, res) => {
  const user = currentUser(req);
  const propertyId = idSchema.parse(req.params.propertyId);
  const role = await assertPropertyMember(user.id, propertyId);
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: { _count: { select: { rooms: true, tenants: true, expenses: true, notifications: true } } },
  });
  if (!property) throw new HttpError(404, 'ไม่พบโครงการ', 'PROPERTY_NOT_FOUND');
  res.json({ ...property, role });
});

router.patch('/:propertyId', async (req, res) => {
  const user = currentUser(req);
  const propertyId = idSchema.parse(req.params.propertyId);
  assertCanManage(await assertPropertyMember(user.id, propertyId));
  const input = updateSchema.parse(req.body);
  const property = await prisma.property.update({ where: { id: propertyId }, data: input });
  res.json(property);
});

router.delete('/:propertyId', async (req, res) => {
  const user = currentUser(req);
  const propertyId = idSchema.parse(req.params.propertyId);
  const role = await assertPropertyMember(user.id, propertyId);
  if (role !== 'OWNER') throw new HttpError(403, 'เฉพาะเจ้าของโครงการเท่านั้นที่ลบโครงการได้', 'ROLE_FORBIDDEN');
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: { _count: { select: { rooms: true, tenants: true, expenses: true } } },
  });
  if (!property) throw new HttpError(404, 'ไม่พบโครงการ', 'PROPERTY_NOT_FOUND');
  if (property._count.rooms > 0 || property._count.tenants > 0 || property._count.expenses > 0) {
    throw new HttpError(409, 'ต้องลบข้อมูลห้อง ผู้เช่า และรายจ่ายออกก่อนจึงจะลบโครงการได้', 'PROPERTY_NOT_EMPTY');
  }
  await prisma.property.delete({ where: { id: propertyId } });
  res.status(204).end();
});

export default router;
