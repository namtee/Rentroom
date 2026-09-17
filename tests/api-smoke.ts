export {};

const base = 'http://127.0.0.1:8787/api';

function assert(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message);
}

async function json<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!response.ok) throw new Error(`${response.status} ${text}`);
  return (text ? JSON.parse(text) : null) as T;
}

async function main(): Promise<void> {
  assert(process.env.AUTH_BOOTSTRAP_SECRET, 'AUTH_BOOTSTRAP_SECRET is required');

  const health = await json<{ status: string }>(await fetch(`${base}/health`));
  assert(health.status === 'ok', 'health check failed');

  const session = await json<{ token: string }>(await fetch(`${base}/auth/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'owner@teehidz.local', bootstrapSecret: process.env.AUTH_BOOTSTRAP_SECRET }),
  }));
  const headers = { authorization: `Bearer ${session.token}`, 'content-type': 'application/json' };

  const dashboard = await json<{
    property: { typeLabel: string | null };
    rooms: { total: number; occupied: number; vacant: number };
    tenants: { total: number };
    maintenance: { open: number };
    finance: { income: { value: number }; expense: { value: number }; profit: { value: number } };
  }>(await fetch(`${base}/dashboard/summary?propertyId=property_suksan`, { headers }));
  assert(dashboard.rooms.total === 48 && dashboard.rooms.occupied === 42 && dashboard.rooms.vacant === 6, 'dashboard room counts failed');
  assert(dashboard.tenants.total === 42 && dashboard.maintenance.open === 3, 'dashboard aggregate counts failed');
  assert(dashboard.property.typeLabel === 'คอนโด', 'dashboard property type label failed');
  assert(dashboard.finance.income.value === 126500 && dashboard.finance.expense.value === 52300 && dashboard.finance.profit.value === 74200, 'dashboard finance totals failed');

  const property = await json<{ id: string }>(await fetch(`${base}/properties`, {
    method: 'POST', headers, body: JSON.stringify({ name: 'API Smoke Property', type: 'ROOM_RENTAL', typeLabel: 'ห้องเช่า' }),
  }));
  const propertyBase = `${base}/properties/${property.id}`;

  const room = await json<{ id: string; monthlyRent: number; status: string }>(await fetch(`${propertyBase}/rooms`, {
    method: 'POST', headers, body: JSON.stringify({ number: '501', floor: 5, monthlyRent: 4000 }),
  }));
  assert(room.monthlyRent === 4000 && room.status === 'VACANT', 'room create failed');

  const tenant = await json<{ id: string }>(await fetch(`${propertyBase}/tenants`, {
    method: 'POST', headers, body: JSON.stringify({ title: 'นาย', firstName: 'ทดสอบ', lastName: 'ระบบ', gender: 'MALE' }),
  }));

  const lease = await json<{ id: string; rent: number; deposit: number; room: { monthlyRent: number } }>(await fetch(`${propertyBase}/leases`, {
    method: 'POST', headers, body: JSON.stringify({ roomId: room.id, tenantId: tenant.id, startDate: '2026-09-01T00:00:00.000Z', endDate: '2027-08-31T00:00:00.000Z', rent: 4000, deposit: 8000 }),
  }));
  assert(lease.rent === 4000 && lease.deposit === 8000 && lease.room.monthlyRent === 4000, 'lease money conversion failed');

  const payment = await json<{ id: string; amount: number; paidAt: string }>(await fetch(`${propertyBase}/finance/payments`, {
    method: 'POST', headers, body: JSON.stringify({ leaseId: lease.id, amount: 4000, period: '2026-09', status: 'PAID' }),
  }));
  assert(payment.amount === 4000 && payment.paidAt, 'payment create failed');

  const expense = await json<{ id: string }>(await fetch(`${propertyBase}/finance/expenses`, {
    method: 'POST', headers, body: JSON.stringify({ category: 'ทดสอบ', amount: 1000, spentAt: '2026-09-17T00:00:00.000Z' }),
  }));
  const maintenance = await json<{ id: string }>(await fetch(`${propertyBase}/maintenance`, {
    method: 'POST', headers, body: JSON.stringify({ roomId: room.id, title: 'ทดสอบแจ้งซ่อม' }),
  }));

  const payments = await json<{ items: Array<{ amount: number; lease: { rent: number; room: { monthlyRent: number } } }> }>(
    await fetch(`${propertyBase}/finance/payments`, { headers }),
  );
  assert(payments.items[0]?.amount === 4000 && payments.items[0].lease.rent === 4000 && payments.items[0].lease.room.monthlyRent === 4000, 'nested money conversion failed');

  await json(await fetch(`${propertyBase}/finance/payments/${payment.id}`, { method: 'PATCH', headers, body: JSON.stringify({ status: 'PENDING' }) }));
  const pending = await json<{ items: Array<{ paidAt: string | null }> }>(await fetch(`${propertyBase}/finance/payments?status=PENDING`, { headers }));
  assert(pending.items[0]?.paidAt === null, 'pending payment paidAt invariant failed');

  await json(await fetch(`${propertyBase}/leases/${lease.id}`, { method: 'PATCH', headers, body: JSON.stringify({ status: 'CANCELLED' }) }));
  const roomDetail = await json<{ status: string }>(await fetch(`${propertyBase}/rooms/${room.id}`, { headers }));
  assert(roomDetail.status === 'VACANT', 'lease cancellation did not vacate room');

  const deletes = [
    `${propertyBase}/finance/payments/${payment.id}`,
    `${propertyBase}/maintenance/${maintenance.id}`,
    `${propertyBase}/finance/expenses/${expense.id}`,
    `${propertyBase}/leases/${lease.id}`,
    `${propertyBase}/tenants/${tenant.id}`,
    `${propertyBase}/rooms/${room.id}`,
    `${base}/properties/${property.id}`,
  ];
  for (const url of deletes) {
    const response = await fetch(url, { method: 'DELETE', headers });
    assert(response.status === 204, `delete failed: ${url} -> ${response.status}`);
  }

  console.log('API smoke passed: health, auth, dashboard, CRUD, money, and status invariants');
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
