import { Router } from 'express';
import * as catalog from '../services/catalog.service.js';

export const catalogRouter = Router();

catalogRouter.get('/categories', async (_req, res) => {
  res.json({ categories: await catalog.listCategories() });
});

catalogRouter.get('/ingredients', async (_req, res) => {
  res.json({ ingredients: await catalog.listIngredients() });
});
