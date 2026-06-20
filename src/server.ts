import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { env } from './config/env.js';

async function bootstrap() {
  await connectDatabase();
  const app = createApp();

  const server = app.listen(env.PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${env.PORT}`);
    console.log(`API available at /api/v1`);
    console.log(`CORS origins: ${env.CORS_ORIGINS.join(', ')}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`${signal} received, shutting down gracefully`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

bootstrap().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
