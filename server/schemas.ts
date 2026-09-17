import { z } from 'zod';

export const idSchema = z.string().min(1).max(191);
export const moneyBahtSchema = z.coerce.number().int().min(0).max(1_000_000_000);
export const periodSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export function pagination(page: number, limit: number): { skip: number; take: number } {
  return { skip: (page - 1) * limit, take: limit };
}
