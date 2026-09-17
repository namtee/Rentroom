import { createHmac, timingSafeEqual } from 'node:crypto';
import { HttpError } from './httpError';

export interface SessionClaims { sub: string; email: string; iat: number; exp: number }

const encode = (value: string): string => Buffer.from(value).toString('base64url');
const signature = (input: string, secret: string): Buffer => createHmac('sha256', secret).update(input).digest();

export function signSession(user: { id: string; email: string }, secret: string, ttlSeconds: number, now = Date.now()): string {
  const header = encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const iat = Math.floor(now / 1000);
  const body = `${header}.${encode(JSON.stringify({ sub: user.id, email: user.email, iat, exp: iat + ttlSeconds }))}`;
  return `${body}.${signature(body, secret).toString('base64url')}`;
}

export function verifySession(token: string, secret: string, now = Date.now()): SessionClaims {
  const [header, payload, sig, extra] = token.split('.');
  if (!header || !payload || !sig || extra) throw new HttpError(401, 'โทเคนไม่ถูกต้อง', 'INVALID_TOKEN');
  const body = `${header}.${payload}`;
  const supplied = Buffer.from(sig, 'base64url');
  const expected = signature(body, secret);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) throw new HttpError(401, 'โทเคนไม่ถูกต้อง', 'INVALID_TOKEN');
  let claims: SessionClaims;
  try { claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as SessionClaims; }
  catch { throw new HttpError(401, 'โทเคนไม่ถูกต้อง', 'INVALID_TOKEN'); }
  if (!claims.sub || !claims.email || !Number.isInteger(claims.exp) || claims.exp <= Math.floor(now / 1000)) {
    throw new HttpError(401, 'เซสชันหมดอายุหรือไม่ถูกต้อง', 'EXPIRED_TOKEN');
  }
  return claims;
}
