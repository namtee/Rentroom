import { PrismaClient, type Gender } from '@prisma/client';
import { bangkokMonthRange } from '../server/lib/time';

const prisma = new PrismaClient();
const PROPERTY_ID = 'property_suksan';
const USER_ID = 'user_owner';
const reference = new Date();
const currentPeriod = bangkokMonthRange(reference, 0).period;
const previousPeriod = bangkokMonthRange(reference, -1).period;
const twoMonthsAgoPeriod = bangkokMonthRange(reference, -2).period;

function bangkokDate(period: string, day: number, hour: number, minute = 0): Date {
  const [year, month] = period.split('-').map(Number);
  return new Date(Date.UTC(year!, month! - 1, day, hour, minute) - 7 * 60 * 60 * 1000);
}

const tenantNames = Array.from({ length: 42 }, (_, index) => {
  const isFemale = (index < 24 && index !== 1 && index !== 3 && index !== 6) || (index >= 24 && index <= 26);
  const title = isFemale ? 'น.ส.' : 'นาย';
  const num = String(index + 1).padStart(2, '0');
  return [title, 'ผู้เช่าสมมุติ', num] as const;
});


function roomNumbers(): string[] {
  return Array.from({ length: 4 }, (_, floor) => Array.from({ length: 12 }, (_, room) => `${floor + 1}${String(room + 1).padStart(2, '0')}`)).flat();
}

function isoDateForRoom(number: string): Date {
  const fixed: Record<string, string> = {
    '101': '2026-01-31T16:59:59.000Z',
    '102': '2026-02-15T16:59:59.000Z',
    '104': '2025-12-20T16:59:59.000Z',
    '105': '2026-01-10T16:59:59.000Z',
    '110': '2025-09-26T16:59:59.000Z',
  };
  return new Date(fixed[number] ?? '2026-03-31T16:59:59.000Z');
}

async function main(): Promise<void> {
  if (process.env.NODE_ENV === 'production') throw new Error('Refusing to seed production');

  await prisma.notification.deleteMany();
  await prisma.maintenanceRequest.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.lease.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.room.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.propertyMember.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: { id: USER_ID, email: 'owner@teehidz.local', displayName: 'คุณตี๋หิด', role: 'OWNER' },
  });
  await prisma.property.create({
    data: { id: PROPERTY_ID, name: 'ตี๋หิด คอนโด', type: 'CONDO', typeLabel: 'คอนโด', plan: 'PREMIUM' },
  });

  await prisma.propertyMember.create({ data: { userId: USER_ID, propertyId: PROPERTY_ID, role: 'OWNER' } });

  const vacant = new Set(['103', '112', '207', '309', '405', '412']);
  const lowRent = new Set(['101', '102', '106', '107', '108', '109', '110', '111', '201']);
  const numbers = roomNumbers();
  await prisma.room.createMany({
    data: numbers.map((number) => ({
      id: `room_${number}`,
      propertyId: PROPERTY_ID,
      number,
      floor: Number(number[0]),
      monthlyRent: (lowRent.has(number) ? 3500 : 3800) * 100,
      status: vacant.has(number) ? 'VACANT' : 'OCCUPIED',
    })),
  });

  const occupied = numbers.filter((number) => !vacant.has(number));
  const genders: Gender[] = tenantNames.map((_, index) => index < 24 ? 'FEMALE' : 'MALE');
  genders[1] = 'MALE'; genders[3] = 'MALE'; genders[6] = 'MALE';
  genders[24] = 'FEMALE'; genders[25] = 'FEMALE'; genders[26] = 'FEMALE';
  const femaleCount = genders.filter((g) => g === 'FEMALE').length;
  if (femaleCount !== 24) throw new Error(`Seed gender distribution invalid: female=${femaleCount}`);

  for (let index = 0; index < occupied.length; index += 1) {
    const number = occupied[index]!;
    const [title, firstName, lastName] = tenantNames[index]!;
    const tenantId = `tenant_${String(index + 1).padStart(2, '0')}`;
    await prisma.tenant.create({
      data: { id: tenantId, propertyId: PROPERTY_ID, title, firstName, lastName, gender: genders[index]! },
    });
    await prisma.lease.create({
      data: {
        id: `lease_${number}`,
        roomId: `room_${number}`,
        tenantId,
        startDate: new Date('2025-01-01T00:00:00.000Z'),
        endDate: isoDateForRoom(number),
        rent: (lowRent.has(number) ? 3500 : 3800) * 100,
        deposit: 7000 * 100,
        status: 'ACTIVE',
      },
    });
  }

  const leaseForRoom = (number: string): string => `lease_${number}`;
  const recentPayments = [
    ['101', 3500, 11, 20, 5],
    ['102', 3500, 11, 19, 42],
    ['104', 3800, 11, 18, 30],
    ['105', 3800, 11, 17, 20],
    ['108', 3500, 10, 16, 12],
  ] as const;
  for (const [number, amount, day, hour, minute] of recentPayments) {
    await prisma.payment.create({
      data: { leaseId: leaseForRoom(number), amount: amount * 100, period: currentPeriod, status: 'PAID', paidAt: bangkokDate(currentPeriod, day, hour, minute) },
    });
  }

  const remainingCurrentMonthAmounts = [...Array<number>(6).fill(3500), ...Array<number>(23).fill(3800)];
  for (let i = 0; i < remainingCurrentMonthAmounts.length; i += 1) {
    const number = occupied[(i + 5) % occupied.length]!;
    await prisma.payment.create({
      data: { leaseId: leaseForRoom(number), amount: remainingCurrentMonthAmounts[i]! * 100, period: currentPeriod, status: 'PAID', paidAt: bangkokDate(currentPeriod, 1 + (i % 9), 15) },
    });
  }

  const monthlyPlans = [
    { period: twoMonthsAgoPeriod, amounts: [...Array<number>(4).fill(3500), ...Array<number>(24).fill(3800)], day: 5 },
    { period: previousPeriod, amounts: [...Array<number>(29).fill(3500), ...Array<number>(3).fill(3800)], day: 5 },
  ];
  for (const plan of monthlyPlans) {
    for (let i = 0; i < plan.amounts.length; i += 1) {
      const number = occupied[i % occupied.length]!;
      await prisma.payment.create({
        data: { leaseId: leaseForRoom(number), amount: plan.amounts[i]! * 100, period: plan.period, status: 'PAID', paidAt: bangkokDate(plan.period, plan.day + (i % 20), 15) },
      });
    }
  }

  await prisma.expense.createMany({
    data: [
      { propertyId: PROPERTY_ID, category: 'ค่าใช้จ่ายรวม', amount: 47600 * 100, spentAt: bangkokDate(twoMonthsAgoPeriod, 20, 12) },
      { propertyId: PROPERTY_ID, category: 'ค่าใช้จ่ายรวม', amount: 49800 * 100, spentAt: bangkokDate(previousPeriod, 20, 12) },
      { propertyId: PROPERTY_ID, category: 'ค่าใช้จ่ายรวม', amount: 52300 * 100, spentAt: bangkokDate(currentPeriod, 10, 12) },
    ],
  });

  await prisma.maintenanceRequest.createMany({
    data: [
      { id: 'maintenance_203', roomId: 'room_203', title: 'น้ำรั่วในห้องน้ำ', status: 'PENDING', createdAt: new Date('2025-09-11T12:12:00.000Z') },
      { id: 'maintenance_208', roomId: 'room_208', title: 'แอร์ไม่เย็น', status: 'IN_PROGRESS', createdAt: new Date('2025-09-11T08:20:00.000Z') },
      { id: 'maintenance_304', roomId: 'room_304', title: 'หลอดไฟชำรุด', status: 'IN_PROGRESS', createdAt: new Date('2025-09-10T11:00:00.000Z') },
    ],
  });

  await prisma.notification.createMany({
    data: [
      { propertyId: PROPERTY_ID, type: 'MAINTENANCE_NEW', title: 'มีแจ้งซ่อมใหม่', body: 'ห้อง 203 - น้ำรั่วในห้องน้ำ', href: '/maintenance/maintenance_203', createdAt: new Date('2025-09-11T12:12:00.000Z') },
      { propertyId: PROPERTY_ID, type: 'PAYMENT_RECEIVED', title: 'ผู้เช่าชำระค่าเช่า', body: 'ห้อง 101 - 3,500 บาท', href: '/finance/payments/seed-101', createdAt: new Date('2025-09-11T13:05:00.000Z') },
      { propertyId: PROPERTY_ID, type: 'LEASE_EXPIRING', title: 'ใกล้หมดสัญญาเช่า', body: 'ห้อง 110 - เหลือ 15 วัน', href: '/leases/lease_110', createdAt: new Date('2025-09-11T08:12:00.000Z') },
      { propertyId: PROPERTY_ID, type: 'ROOM_AVAILABLE', title: 'ห้องว่างพร้อมให้เช่า', body: 'ห้อง 103 - 3,800 บาท/เดือน', href: '/rooms/room_103?seed=1', readAt: reference, createdAt: new Date('2025-09-11T06:12:00.000Z') },
    ],
  });

  for (const number of ['105', '104', '103', '102', '101']) {
    await prisma.room.update({ where: { id: `room_${number}` }, data: { coverImageUrl: null } });
  }

  console.log('Seed complete: owner@teehidz.local / property_suksan');
}

void main().finally(() => prisma.$disconnect());
