import express from 'express';
import cors from 'cors';
import { getCorsOptions } from './config/cors.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(cors(getCorsOptions()));
  app.use(express.json({ limit: '2mb' }));

  app.get('/', (_req, res) => {
    res.json({
      name: 'System Design Playground API',
      version: '1.0.0',
      health: '/api/v1/health',
    });
  });

  app.use('/api/v1', routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
