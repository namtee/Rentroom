import type { NextFunction, Request, Response } from 'express';
import type { User, UserRole } from '@prisma/client';
import { prisma } from '../db';
import { requireSecret } from '../config';
import { HttpError } from '../lib/httpError';
import { verifySession } from '../lib/jwt';

declare global {
  namespace Express {
    interface Request { authUser?: User }
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authorization = req.header('authorization');
    if (!authorization?.startsWith('Bearer ')) throw new HttpError(401, 'กรุณาเข้าสู่ระบบ', 'AUTH_REQUIRED');
    const claims = verifySession(authorization.slice(7), requireSecret('JWT_SECRET'));
    const user = await prisma.user.findUnique({ where: { id: claims.sub } });
    if (!user) throw new HttpError(401, 'ไม่พบบัญชีผู้ใช้', 'USER_NOT_FOUND');
    req.authUser = user;
    next();
  } catch (error) { next(error); }
}

export function currentUser(req: Request): User {
  if (!req.authUser) throw new HttpError(401, 'กรุณาเข้าสู่ระบบ', 'AUTH_REQUIRED');
  return req.authUser;
}

export async function assertPropertyMember(userId: string, propertyId: string): Promise<UserRole> {
  const member = await prisma.propertyMember.findUnique({
    where: { userId_propertyId: { userId, propertyId } },
    select: { role: true },
  });
  if (!member) throw new HttpError(403, 'คุณไม่มีสิทธิ์เข้าถึงโครงการนี้', 'PROPERTY_FORBIDDEN');
  return member.role;
}

export function assertCanManage(role: UserRole): void {
  if (role === 'STAFF') throw new HttpError(403, 'สิทธิ์ของคุณไม่สามารถแก้ไขข้อมูลนี้ได้', 'ROLE_FORBIDDEN');
}
