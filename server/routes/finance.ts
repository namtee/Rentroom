import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { HttpError } from '../lib/httpError';
import { bahtToSatang, satangToBaht } from '../lib/money';
import { assertCanManage, assertPropertyMember, currentUser, requireAuth } from '../middleware/auth';
import { idSchema, moneyBahtSchema, pagination, paginationSchema, periodSchema } from '../schemas';
import { createNotificationOnce } from '../services/notifications';

const router = Router({ mergeParams: true });
const paramsSchema = z.object({ propertyId: idSchema });
const paymentListSchema = paginationSchema.extend({ status: z.enum(['PAID', 'PENDING', 'OVERDUE']).optional(), period: periodSchema.optional() });
const paymentCreateSchema = z.object({
  leaseId: idSchema,
  amount: moneyBahtSchema,
  period: periodSchema,
  status: z.enum(['PAID', 'PENDING', 'OVERDUE']).default('PENDING'),
  paidAt: z.coerce.date().nullable().optional(),
});
const paymentUpdateSchema = z.object({
  amount: moneyBahtSchema.optional(),
  period: periodSchema.optional(),
  status: z.enum(['PAID', 'PENDING', 'OVERDUE']).optional(),
  paidAt: z.coerce.date().nullable().optional(),
});
const expenseListSchema = paginationSchema.extend({ category: z.string().trim().max(80).optional() });
const expenseCreateSchema = z.object({
  category: z.string().trim().min(1).max(100),
  amount: moneyBahtSchema,
  spentAt: z.coerce.date(),
  note: z.string().trim().max(500).nullable().optional(),
});
const expenseUpdateSchema = expenseCreateSchema.partial();

router.use(requireAuth);

async function notifyPayment(paymentId: string): Promise<void> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { lease: { include: { room: true } } },
  });
  if (!payment || payment.status !== 'PAID') return;
  await createNotificationOnce({
    propertyId: payment.lease.room.propertyId,
    type: 'PAYMENT_RECEIVED',
    title: 'ผู้เช่าชำระค่าเช่า',
    body: `ห้อง ${payment.lease.room.number} - ${satangToBaht(payment.amount).toLocaleString('en-US')} บาท`,
    href: `/finance/payments/${payment.id}`,
    createdAt: payment.paidAt ?? new Date(),
  });
}

router.get('/payments', async (req, res) => {
  const user = currentUser(req);
  const { propertyId } = paramsSchema.parse(req.params);
  await assertPropertyMember(user.id, propertyId);
  const query = paymentListSchema.parse(req.query);
  const where = {
    lease: { room: { propertyId } },
    ...(query.status ? { status: query.status } : {}),
    ...(query.period ? { period: query.period } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.payment.findMany({ where, ...pagination(query.page, query.limit), orderBy: [{ paidAt: 'desc' }, { period: 'desc' }], include: { lease: { include: { room: true, tenant: true } } } }),
    prisma.payment.count({ where }),
  ]);
  res.json({
    items: items.map((p) => ({
      ...p,
      amount: satangToBaht(p.amount),
      lease: {
        ...p.lease,
        rent: satangToBaht(p.lease.rent),
        deposit: satangToBaht(p.lease.deposit),
        room: { ...p.lease.room, monthlyRent: satangToBaht(p.lease.room.monthlyRent) },
      },
    })),
    page: query.page,
    limit: query.limit,
    total,
  });
});

router.post('/payments', async (req, res) => {
  const user = currentUser(req);
  const { propertyId } = paramsSchema.parse(req.params);
  assertCanManage(await assertPropertyMember(user.id, propertyId));
  const input = paymentCreateSchema.parse(req.body);
  if (input.status !== 'PAID' && input.paidAt) throw new HttpError(400, 'รายการที่ยังไม่ชำระต้องไม่มีวันที่ชำระ', 'INVALID_PAYMENT_DATE');
  const lease = await prisma.lease.findFirst({ where: { id: input.leaseId, room: { propertyId } }, select: { id: true } });
  if (!lease) throw new HttpError(404, 'ไม่พบสัญญาเช่า', 'LEASE_NOT_FOUND');
  const payment = await prisma.payment.create({
    data: {
      ...input,
      amount: bahtToSatang(input.amount),
      paidAt: input.status === 'PAID' ? (input.paidAt ?? new Date()) : input.paidAt,
    },
  });
  await notifyPayment(payment.id);
  res.status(201).json({ ...payment, amount: satangToBaht(payment.amount) });
});

router.patch('/payments/:paymentId', async (req, res) => {
  const user = currentUser(req);
  const { propertyId } = paramsSchema.parse(req.params);
  const paymentId = idSchema.parse(req.params.paymentId);
  assertCanManage(await assertPropertyMember(user.id, propertyId));
  const input = paymentUpdateSchema.parse(req.body);
  const existing = await prisma.payment.findFirst({ where: { id: paymentId, lease: { room: { propertyId } } } });
  if (!existing) throw new HttpError(404, 'ไม่พบรายการชำระเงิน', 'PAYMENT_NOT_FOUND');
  const nextStatus = input.status ?? existing.status;
  if (nextStatus !== 'PAID' && input.paidAt) throw new HttpError(400, 'รายการที่ยังไม่ชำระต้องไม่มีวันที่ชำระ', 'INVALID_PAYMENT_DATE');
  const payment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      ...input,
      ...(input.amount === undefined ? {} : { amount: bahtToSatang(input.amount) }),
      paidAt: nextStatus === 'PAID' ? (input.paidAt ?? existing.paidAt ?? new Date()) : null,
    },
  });
  if (existing.status !== 'PAID' && payment.status === 'PAID') await notifyPayment(payment.id);
  res.json({ ...payment, amount: satangToBaht(payment.amount) });
});

router.delete('/payments/:paymentId', async (req, res) => {
  const user = currentUser(req);
  const { propertyId } = paramsSchema.parse(req.params);
  const paymentId = idSchema.parse(req.params.paymentId);
  assertCanManage(await assertPropertyMember(user.id, propertyId));
  const payment = await prisma.payment.findFirst({ where: { id: paymentId, lease: { room: { propertyId } } }, select: { id: true } });
  if (!payment) throw new HttpError(404, 'ไม่พบรายการชำระเงิน', 'PAYMENT_NOT_FOUND');
  await prisma.payment.delete({ where: { id: paymentId } });
  res.status(204).end();
});

router.get('/expenses', async (req, res) => {
  const user = currentUser(req);
  const { propertyId } = paramsSchema.parse(req.params);
  await assertPropertyMember(user.id, propertyId);
  const query = expenseListSchema.parse(req.query);
  const where = { propertyId, ...(query.category ? { category: { contains: query.category, mode: 'insensitive' as const } } : {}) };
  const [items, total] = await Promise.all([
    prisma.expense.findMany({ where, ...pagination(query.page, query.limit), orderBy: { spentAt: 'desc' } }),
    prisma.expense.count({ where }),
  ]);
  res.json({ items: items.map((e) => ({ ...e, amount: satangToBaht(e.amount) })), page: query.page, limit: query.limit, total });
});

router.post('/expenses', async (req, res) => {
  const user = currentUser(req);
  const { propertyId } = paramsSchema.parse(req.params);
  assertCanManage(await assertPropertyMember(user.id, propertyId));
  const input = expenseCreateSchema.parse(req.body);
  const expense = await prisma.expense.create({ data: { ...input, propertyId, amount: bahtToSatang(input.amount) } });
  res.status(201).json({ ...expense, amount: satangToBaht(expense.amount) });
});

router.patch('/expenses/:expenseId', async (req, res) => {
  const user = currentUser(req);
  const { propertyId } = paramsSchema.parse(req.params);
  const expenseId = idSchema.parse(req.params.expenseId);
  assertCanManage(await assertPropertyMember(user.id, propertyId));
  const input = expenseUpdateSchema.parse(req.body);
  const existing = await prisma.expense.findFirst({ where: { id: expenseId, propertyId }, select: { id: true } });
  if (!existing) throw new HttpError(404, 'ไม่พบรายจ่าย', 'EXPENSE_NOT_FOUND');
  const expense = await prisma.expense.update({
    where: { id: expenseId },
    data: { ...input, ...(input.amount === undefined ? {} : { amount: bahtToSatang(input.amount) }) },
  });
  res.json({ ...expense, amount: satangToBaht(expense.amount) });
});

router.delete('/expenses/:expenseId', async (req, res) => {
  const user = currentUser(req);
  const { propertyId } = paramsSchema.parse(req.params);
  const expenseId = idSchema.parse(req.params.expenseId);
  assertCanManage(await assertPropertyMember(user.id, propertyId));
  const expense = await prisma.expense.findFirst({ where: { id: expenseId, propertyId }, select: { id: true } });
  if (!expense) throw new HttpError(404, 'ไม่พบรายจ่าย', 'EXPENSE_NOT_FOUND');
  await prisma.expense.delete({ where: { id: expenseId } });
  res.status(204).end();
});

export default router;
