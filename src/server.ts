import { createApp } from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';

async function bootstrap() {
  await connectDatabase();
  const app = createApp();

  app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
    console.log(`API available at http://localhost:${env.PORT}/api/v1`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
