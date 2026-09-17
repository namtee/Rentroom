import { timingSafeEqual } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { getConfig, requireSecret } from '../config';
import { HttpError } from '../lib/httpError';
import { signSession } from '../lib/jwt';
import { currentUser, requireAuth } from '../middleware/auth';

const router = Router();
const loginSchema = z.object({ email: z.string().email(), bootstrapSecret: z.string().min(12) });

function secretMatches(value: string, expected: string): boolean {
  const left = Buffer.from(value);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

router.post('/token', async (req, res) => {
  const input = loginSchema.parse(req.body);
  if (!secretMatches(input.bootstrapSecret, requireSecret('AUTH_BOOTSTRAP_SECRET'))) {
    throw new HttpError(401, 'ข้อมูลเข้าสู่ระบบไม่ถูกต้อง', 'INVALID_LOGIN');
  }
  const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (!user) throw new HttpError(401, 'ข้อมูลเข้าสู่ระบบไม่ถูกต้อง', 'INVALID_LOGIN');
  const config = getConfig();
  res.json({
    token: signSession(user, requireSecret('JWT_SECRET'), config.JWT_TTL_SECONDS),
    expiresIn: config.JWT_TTL_SECONDS,
    user: { id: user.id, email: user.email, displayName: user.displayName, avatarUrl: user.avatarUrl, role: user.role },
  });
});

router.get('/me', requireAuth, async (req, res) => {
  const user = currentUser(req);
  const properties = await prisma.propertyMember.findMany({
    where: { userId: user.id },
    include: { property: true },
    orderBy: { property: { name: 'asc' } },
  });
  res.json({
    user: { id: user.id, email: user.email, displayName: user.displayName, avatarUrl: user.avatarUrl, role: user.role },
    properties: properties.map(({ property, role }) => ({ ...property, role })),
  });
});

export default router;
