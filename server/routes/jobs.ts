import { timingSafeEqual } from 'node:crypto';
import { Router } from 'express';
import { requireSecret } from '../config';
import { HttpError } from '../lib/httpError';
import { createLeaseExpiryNotifications } from '../services/leaseExpiry';

const router = Router();

function sameSecret(value: string | undefined, expected: string): boolean {
  if (!value) return false;
  const left = Buffer.from(value);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

router.post('/lease-expiry', async (req, res) => {
  if (!sameSecret(req.header('x-job-secret'), requireSecret('LEASE_JOB_SECRET'))) {
    throw new HttpError(401, 'ไม่สามารถเรียกใช้งานงานระบบได้', 'JOB_UNAUTHORIZED');
  }
  res.json({ created: await createLeaseExpiryNotifications() });
});

export default router;
