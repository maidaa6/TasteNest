import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { authenticate, optionalAuth, requireRole } from '../middleware/auth.js';
import * as recipes from '../controllers/recipes.controller.js';

export const UNITS = ['g', 'kg', 'ml', 'l', 'kos'];

const ingredientLine = z.object({
  ingredientId: z.uuid('Izberite sestavino.'),
  quantity: z.number('Količina mora biti število.')
    .positive('Količina mora biti pozitivna.')
    .max(99_999_999, 'Količina je prevelika.')
    // Stored as DECIMAL(10, 2)
    .transform((q) => Math.round(q * 100) / 100)
    .refine((q) => q > 0, 'Količina je premajhna.'),
  unit: z.enum(UNITS, 'Enota mora biti g, kg, ml, l ali kos.'),
});

const ingredientLines = z.array(ingredientLine, 'Sestavine so obvezne.')
  .min(1, 'Recept potrebuje vsaj eno sestavino.')
  .superRefine((lines, ctx) => {
    const seen = new Set();
    lines.forEach((line, index) => {
      const key = `${line.ingredientId}:${line.unit}`;
      if (seen.has(key)) {
        ctx.addIssue({ code: 'custom', path: [index, 'ingredientId'], message: 'Sestavina s to enoto je že navedena.' });
      }
      seen.add(key);
    });
  });

const recipeFields = z.object({
  title: z.string('Naslov je obvezen.').trim().min(1, 'Naslov je obvezen.').max(200, 'Naslov je predolg.'),
  description: z.string().trim().max(2000, 'Opis je predolg.').nullish().transform((v) => v || null),
  instructions: z.string('Postopek je obvezen.').trim().min(1, 'Postopek je obvezen.').max(20_000, 'Postopek je predolg.'),
  categoryId: z.uuid('Izberite kategorijo.'),
  prepMinutes: z.number('Čas priprave mora biti število.')
    .int('Čas priprave mora biti celo število minut.')
    .min(0, 'Čas priprave ne sme biti negativen.')
    .max(10_080, 'Čas priprave je predolg.'),
  baseServings: z.number('Število porcij mora biti število.')
    .int('Število porcij mora biti celo število.')
    .positive('Število porcij mora biti pozitivno.')
    .max(100, 'Število porcij je preveliko.'),
  ingredients: ingredientLines,
});

// Empty query parameters (e.g. `?categoryId=` from a cleared form) mean "no filter".
const optionalParam = (schema) => z.preprocess((v) => (v === '' ? undefined : v), schema.optional());

const searchQuery = z.object({
  q: optionalParam(z.string().trim().max(100, 'Iskalni niz je predolg.')),
  ingredientId: optionalParam(z.uuid('Neveljavna sestavina.')),
  categoryId: optionalParam(z.uuid('Neveljavna kategorija.')),
  maxPrepMinutes: optionalParam(z.coerce.number('Čas priprave mora biti število.')
    .int('Čas priprave mora biti celo število minut.')
    .min(0, 'Čas priprave ne sme biti negativen.')),
});

const author = [authenticate, requireRole('AUTHOR')];

export const recipesRouter = Router();

recipesRouter.get('/', validate({ query: searchQuery }), recipes.search);
recipesRouter.get('/mine', ...author, recipes.listMine);
recipesRouter.get('/:id', optionalAuth, recipes.get);
recipesRouter.post('/', ...author, validate({ body: recipeFields }), recipes.create);
recipesRouter.patch('/:id', ...author, validate({ body: recipeFields.partial() }), recipes.update);
