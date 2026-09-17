import { prisma } from '../db';
import { createLeaseExpiryNotifications } from '../services/leaseExpiry';

void createLeaseExpiryNotifications()
  .then((created) => console.log(`Lease expiry notifications created: ${created}`))
  .finally(() => prisma.$disconnect());
