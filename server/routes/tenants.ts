import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { HttpError } from '../lib/httpError';
import { satangToBaht } from '../lib/money';
import { assertCanManage, assertPropertyMember, currentUser, requireAuth } from '../middleware/auth';
import { idSchema, pagination, paginationSchema } from '../schemas';

const router = Router({ mergeParams: true });
const paramsSchema = z.object({ propertyId: idSchema });
const listSchema = paginationSchema.extend({ search: z.string().trim().max(100).optional() });
const createSchema = z.object({
  title: z.string().trim().min(1).max(20),
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  gender: z.enum(['MALE', 'FEMALE', 'UNSPECIFIED']).default('UNSPECIFIED'),
  phone: z.string().trim().min(6).max(30).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
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
    ...(query.search ? {
      OR: [
        { firstName: { contains: query.search, mode: 'insensitive' as const } },
        { lastName: { contains: query.search, mode: 'insensitive' as const } },
        { phone: { contains: query.search } },
      ],
    } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.tenant.findMany({
      where,
      ...pagination(query.page, query.limit),
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      include: { leases: { where: { status: 'ACTIVE' }, take: 1, include: { room: true } } },
    }),
    prisma.tenant.count({ where }),
  ]);
  res.json({
    items: items.map((tenant) => ({
      ...tenant,
      leases: tenant.leases.map((lease) => ({
        ...lease,
        rent: satangToBaht(lease.rent),
        deposit: satangToBaht(lease.deposit),
        room: { ...lease.room, monthlyRent: satangToBaht(lease.room.monthlyRent) },
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
  const tenant = await prisma.tenant.create({ data: { ...input, propertyId } });
  res.status(201).json(tenant);
});

router.get('/:tenantId', async (req, res) => {
  const user = currentUser(req);
  const { propertyId } = paramsSchema.parse(req.params);
  const tenantId = idSchema.parse(req.params.tenantId);
  await assertPropertyMember(user.id, propertyId);
  const tenant = await prisma.tenant.findFirst({
    where: { id: tenantId, propertyId },
    include: { leases: { orderBy: { startDate: 'desc' }, include: { room: true, payments: { orderBy: { period: 'desc' } } } } },
  });
  if (!tenant) throw new HttpError(404, 'ไม่พบผู้เช่า', 'TENANT_NOT_FOUND');
  res.json({
    ...tenant,
    leases: tenant.leases.map((lease) => ({
      ...lease,
      rent: satangToBaht(lease.rent),
      deposit: satangToBaht(lease.deposit),
      room: { ...lease.room, monthlyRent: satangToBaht(lease.room.monthlyRent) },
      payments: lease.payments.map((payment) => ({ ...payment, amount: satangToBaht(payment.amount) })),
    })),
  });
});

router.patch('/:tenantId', async (req, res) => {
  const user = currentUser(req);
  const { propertyId } = paramsSchema.parse(req.params);
  const tenantId = idSchema.parse(req.params.tenantId);
  assertCanManage(await assertPropertyMember(user.id, propertyId));
  const input = updateSchema.parse(req.body);
  const existing = await prisma.tenant.findFirst({ where: { id: tenantId, propertyId }, select: { id: true } });
  if (!existing) throw new HttpError(404, 'ไม่พบผู้เช่า', 'TENANT_NOT_FOUND');
  res.json(await prisma.tenant.update({ where: { id: tenantId }, data: input }));
});

router.delete('/:tenantId', async (req, res) => {
  const user = currentUser(req);
  const { propertyId } = paramsSchema.parse(req.params);
  const tenantId = idSchema.parse(req.params.tenantId);
  assertCanManage(await assertPropertyMember(user.id, propertyId));
  const tenant = await prisma.tenant.findFirst({
    where: { id: tenantId, propertyId },
    include: { _count: { select: { leases: true } } },
  });
  if (!tenant) throw new HttpError(404, 'ไม่พบผู้เช่า', 'TENANT_NOT_FOUND');
  if (tenant._count.leases > 0) throw new HttpError(409, 'ไม่สามารถลบผู้เช่าที่มีประวัติสัญญาเช่าได้', 'TENANT_HAS_HISTORY');
  await prisma.tenant.delete({ where: { id: tenantId } });
  res.status(204).end();
});

export default router;
