import cors from 'cors';
import express from 'express';
import { getConfig } from './config';
import { prisma } from './db';
import { HttpError } from './lib/httpError';
import { errorHandler } from './middleware/error';
import authRouter from './routes/auth';
import dashboardRouter from './routes/dashboard';
import financeRouter from './routes/finance';
import jobsRouter from './routes/jobs';
import leasesRouter from './routes/leases';
import maintenanceRouter from './routes/maintenance';
import notificationsRouter from './routes/notifications';
import propertiesRouter from './routes/properties';
import roomsRouter from './routes/rooms';
import tenantsRouter from './routes/tenants';

export function createApp(): express.Express {
  const config = getConfig();
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'ok', timestamp: new Date().toISOString() });
  });
  app.use('/api/auth', authRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/properties', propertiesRouter);
  app.use('/api/properties/:propertyId/rooms', roomsRouter);
  app.use('/api/properties/:propertyId/tenants', tenantsRouter);
  app.use('/api/properties/:propertyId/leases', leasesRouter);
  app.use('/api/properties/:propertyId/finance', financeRouter);
  app.use('/api/properties/:propertyId/maintenance', maintenanceRouter);
  app.use('/api/properties/:propertyId/notifications', notificationsRouter);
  app.use('/api/jobs', jobsRouter);

  app.use((_req, _res, next) => next(new HttpError(404, 'ไม่พบ API ที่เรียก', 'ROUTE_NOT_FOUND')));
  app.use(errorHandler);
  return app;
}
