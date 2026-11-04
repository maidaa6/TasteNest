import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { catalogRouter } from './catalog.routes.js';
import { recipesRouter } from './recipes.routes.js';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/recipes', recipesRouter);
apiRouter.use(catalogRouter);
