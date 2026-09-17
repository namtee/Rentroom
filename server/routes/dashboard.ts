import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { changePct, occupancyPct } from '../lib/kpi';
import { satangToBaht } from '../lib/money';
import { bangkokMonthRange, bangkokPeriod } from '../lib/time';
import { assertPropertyMember, currentUser, requireAuth } from '../middleware/auth';
import { idSchema } from '../schemas';

const router = Router();
const querySchema = z.object({ propertyId: idSchema });

router.get('/summary', requireAuth, async (req, res) => {
  const user = currentUser(req);
  const { propertyId } = querySchema.parse(req.query);
  const memberRole = await assertPropertyMember(user.id, propertyId);
  const now = new Date();
  const ranges = [-2, -1, 0].map((offset) => bangkokMonthRange(now, offset));
  const threeMonthStart = ranges[0]!.start;
  const currentEnd = ranges[2]!.end;

  const [property, totalRooms, occupiedRooms, tenantGroups, payments, expenses, maintenanceGroups, latestRooms, recentPayments, unreadNotifications, notifications] = await Promise.all([
    prisma.property.findUniqueOrThrow({ where: { id: propertyId } }),
    prisma.room.count({ where: { propertyId } }),
    prisma.room.count({ where: { propertyId, status: 'OCCUPIED' } }),
    prisma.tenant.groupBy({
      by: ['gender'],
      where: { propertyId, leases: { some: { status: 'ACTIVE' } } },
      _count: { _all: true },
    }),
    prisma.payment.findMany({
      where: {
        status: 'PAID',
        paidAt: { gte: threeMonthStart, lt: currentEnd },
        lease: { room: { propertyId } },
      },
      select: { amount: true, paidAt: true },
    }),
    prisma.expense.findMany({
      where: { propertyId, spentAt: { gte: threeMonthStart, lt: currentEnd } },
      select: { amount: true, spentAt: true },
    }),
    prisma.maintenanceRequest.groupBy({
      by: ['status'],
      where: { room: { propertyId }, status: { in: ['PENDING', 'IN_PROGRESS'] } },
      _count: { _all: true },
    }),
    prisma.room.findMany({
      where: { propertyId },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: {
        leases: {
          where: { status: 'ACTIVE' },
          orderBy: { endDate: 'asc' },
          take: 1,
          include: { tenant: true },
        },
      },
    }),
    prisma.payment.findMany({
      where: { status: 'PAID', paidAt: { not: null }, lease: { room: { propertyId } } },
      orderBy: { paidAt: 'desc' },
      take: 5,
      include: { lease: { include: { room: true, tenant: true } } },
    }),
    prisma.notification.count({ where: { propertyId, readAt: null } }),
    prisma.notification.findMany({ where: { propertyId }, orderBy: { createdAt: 'desc' }, take: 4 }),
  ]);

  const monthly = new Map(ranges.map((range) => [range.period, { income: 0, expense: 0 }]));
  for (const payment of payments) {
    if (!payment.paidAt) continue;
    const bucket = monthly.get(bangkokPeriod(payment.paidAt));
    if (bucket) bucket.income += payment.amount;
  }
  for (const expense of expenses) {
    const bucket = monthly.get(bangkokPeriod(expense.spentAt));
    if (bucket) bucket.expense += expense.amount;
  }

  const chart = ranges.map((range) => {
    const values = monthly.get(range.period)!;
    return { period: range.period, income: satangToBaht(values.income), expense: satangToBaht(values.expense) };
  });
  const previous = chart[1]!;
  const current = chart[2]!;
  const currentProfit = current.income - current.expense;
  const previousProfit = previous.income - previous.expense;
  const genderCount = Object.fromEntries(tenantGroups.map((group) => [group.gender, group._count._all]));
  const tenantTotal = tenantGroups.reduce((sum, group) => sum + group._count._all, 0);
  const maintenanceCount = Object.fromEntries(maintenanceGroups.map((group) => [group.status, group._count._all]));

  res.json({
    property: { id: property.id, name: property.name, type: property.type, typeLabel: property.typeLabel, plan: property.plan },
    user: { displayName: user.displayName, role: memberRole, avatarUrl: user.avatarUrl },
    unreadNotifications,
    rooms: { total: totalRooms, occupied: occupiedRooms, vacant: totalRooms - occupiedRooms, occupancyPct: occupancyPct(occupiedRooms, totalRooms) },
    tenants: { total: tenantTotal, male: genderCount.MALE ?? 0, female: genderCount.FEMALE ?? 0 },
    finance: {
      income: { value: current.income, changePct: changePct(current.income, previous.income) },
      expense: { value: current.expense, changePct: changePct(current.expense, previous.expense) },
      profit: { value: currentProfit, changePct: changePct(currentProfit, previousProfit) },
      chart,
    },
    maintenance: {
      open: (maintenanceCount.PENDING ?? 0) + (maintenanceCount.IN_PROGRESS ?? 0),
      inProgress: maintenanceCount.IN_PROGRESS ?? 0,
      pending: maintenanceCount.PENDING ?? 0,
    },
    latestRooms: latestRooms.map((room) => {
      const lease = room.leases[0];
      return {
        id: room.id,
        number: room.number,
        floor: room.floor,
        monthlyRent: satangToBaht(room.monthlyRent),
        status: room.status,
        coverImageUrl: room.coverImageUrl,
        tenantName: lease ? `${lease.tenant.title}${lease.tenant.firstName} ${lease.tenant.lastName}` : null,
        leaseEndDate: lease?.endDate.toISOString().slice(0, 10) ?? null,
      };
    }),
    recentPayments: recentPayments.map((payment) => ({
      id: payment.id,
      tenantName: `${payment.lease.tenant.title}${payment.lease.tenant.firstName} ${payment.lease.tenant.lastName}`,
      avatarUrl: payment.lease.tenant.avatarUrl,
      roomNumber: payment.lease.room.number,
      amount: satangToBaht(payment.amount),
      status: payment.status,
      paidAt: payment.paidAt?.toISOString() ?? null,
    })),
    notifications: notifications.map((item) => ({ ...item, createdAt: item.createdAt.toISOString(), readAt: item.readAt?.toISOString() ?? null })),
  });
});

export default router;
