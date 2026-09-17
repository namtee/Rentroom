import type { ErrorRequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { HttpError } from '../lib/httpError';

export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'ข้อมูลไม่ถูกต้อง', details: error.flatten() } });
    return;
  }
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: { code: error.code, message: error.message, details: error.details } });
    return;
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: { code: 'DUPLICATE', message: 'ข้อมูลนี้มีอยู่ในระบบแล้ว' } });
      return;
    }
    if (error.code === 'P2003') {
      res.status(409).json({ error: { code: 'RELATED_DATA_EXISTS', message: 'ไม่สามารถลบข้อมูลนี้ได้ เนื่องจากมีข้อมูลที่เกี่ยวข้อง' } });
      return;
    }
    if (error.code === 'P2025') {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'ไม่พบข้อมูลที่ต้องการ' } });
      return;
    }
  }
  console.error('Unhandled backend error', error instanceof Error ? error.message : 'Unknown error');
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'ระบบขัดข้อง กรุณาลองใหม่อีกครั้ง' } });
};
