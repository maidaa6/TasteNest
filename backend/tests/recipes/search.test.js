import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma, resetDatabase } from '../helpers/db.js';
import { createUser } from '../helpers/auth.js';
import { createCatalog, createRecipe } from '../helpers/fixtures.js';

const app = createApp();
let catalog;

const search = (query = {}) => request(app).get('/api/recipes').query(query);
const titles = (res) => res.body.recipes.map((r) => r.title).sort();

beforeAll(async () => {
  await resetDatabase();
  const author = await createUser({ role: 'AUTHOR' });
  catalog = await createCatalog();
  const { soups, desserts } = catalog.categories;
  const { korenje, mleko, testenine, jajca } = catalog.ingredients;

  await createRecipe(author, soups, { title: 'Korenčkova juha', prepMinutes: 35, ingredients: [[korenje, 600, 'g']] });
  await createRecipe(author, soups, { title: 'Juha z rezanci', prepMinutes: 20, ingredients: [[testenine, 100, 'g'], [korenje, 1, 'kos']] });
  await createRecipe(author, desserts, { title: 'Palačinke', prepMinutes: 30, ingredients: [[mleko, 500, 'ml'], [jajca, 2, 'kos']] });
  await createRecipe(author, desserts, { title: 'Mlečni riž', prepMinutes: 40, ingredients: [[mleko, 1, 'l']] });
  await createRecipe(author, soups, { title: 'Umaknjena juha', status: 'HIDDEN', prepMinutes: 10, ingredients: [[korenje, 1, 'kos']] });
});
afterAll(() => prisma.$disconnect());

describe('GET /api/recipes (US-04)', () => {
  // AC4
  it('lists only published recipes without login', async () => {
    const res = await search();

    expect(res.status).toBe(200);
    expect(titles(res)).toEqual(['Juha z rezanci', 'Korenčkova juha', 'Mlečni riž', 'Palačinke']);
  });

  it('returns summaries with category and author', async () => {
    const res = await search({ q: 'palačinke' });

    expect(res.body.recipes).toHaveLength(1);
    expect(res.body.recipes[0]).toMatchObject({
      title: 'Palačinke',
      prepMinutes: 30,
      baseServings: 2,
      category: { name: 'Sladice' },
      author: { name: expect.any(String) },
    });
  });

  // AC1
  it.each([
    ['JUHA', ['Juha z rezanci', 'Korenčkova juha']],
    ['rezan', ['Juha z rezanci']],
    ['  riž ', ['Mlečni riž']],
  ])('matches %j partially and case-insensitively', async (q, expected) => {
    expect(titles(await search({ q }))).toEqual(expected);
  });

  // AC2
  it('filters by ingredient', async () => {
    const res = await search({ ingredientId: catalog.ingredients.korenje.id });
    expect(titles(res)).toEqual(['Juha z rezanci', 'Korenčkova juha']);
  });

  it('filters by category', async () => {
    const res = await search({ categoryId: catalog.categories.desserts.id });
    expect(titles(res)).toEqual(['Mlečni riž', 'Palačinke']);
  });

  it('filters by maximum preparation time, inclusive', async () => {
    expect(titles(await search({ maxPrepMinutes: 30 }))).toEqual(['Juha z rezanci', 'Palačinke']);
  });

  // AC3
  it('combines all filters so every result satisfies every condition', async () => {
    const res = await search({
      q: 'juha',
      ingredientId: catalog.ingredients.korenje.id,
      categoryId: catalog.categories.soups.id,
      maxPrepMinutes: 30,
    });
    expect(titles(res)).toEqual(['Juha z rezanci']);
  });

  it('returns an empty list when nothing matches', async () => {
    const res = await search({ q: 'pica' });

    expect(res.status).toBe(200);
    expect(res.body.recipes).toEqual([]);
  });

  it('ignores empty filter values', async () => {
    const res = await search({ q: '', categoryId: '', ingredientId: '', maxPrepMinutes: '' });
    expect(res.body.recipes).toHaveLength(4);
  });

  it.each([
    [{ maxPrepMinutes: '-5' }, 'query.maxPrepMinutes'],
    [{ maxPrepMinutes: 'hitro' }, 'query.maxPrepMinutes'],
    [{ categoryId: 'juhe' }, 'query.categoryId'],
  ])('rejects invalid filter %j', async (query, field) => {
    const res = await search(query);

    expect(res.status).toBe(400);
    expect(res.body.error.details.map((d) => d.field)).toContain(field);
  });
});
