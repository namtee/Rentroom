import { createApp } from './app';
import { getConfig } from './config';
import { prisma } from './db';

const config = getConfig();
const server = createApp().listen(config.PORT, () => {
  console.log(`TeeHidZ backend listening on http://localhost:${config.PORT}`);
});

function shutdown(signal: string): void {
  console.log(`${signal} received, shutting down`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => { void shutdown('SIGINT'); });
process.on('SIGTERM', () => { void shutdown('SIGTERM'); });
