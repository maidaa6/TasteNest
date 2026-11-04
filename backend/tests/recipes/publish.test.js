import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma, resetDatabase } from '../helpers/db.js';
import { bearer, createUser } from '../helpers/auth.js';
import { createCatalog, createRecipe } from '../helpers/fixtures.js';

const app = createApp();

let author;
let catalog;
let payload;

beforeEach(async () => {
  await resetDatabase();
  author = await createUser({ role: 'AUTHOR', name: 'Ana Avtorica' });
  catalog = await createCatalog();
  payload = {
    title: 'Korenčkova juha',
    description: 'Kremna juha.',
    instructions: 'Skuhaj korenje in zmiksaj.',
    categoryId: catalog.categories.soups.id,
    prepMinutes: 30,
    baseServings: 4,
    ingredients: [
      { ingredientId: catalog.ingredients.korenje.id, quantity: 0.6, unit: 'kg' },
      { ingredientId: catalog.ingredients.mleko.id, quantity: 200, unit: 'ml' },
    ],
  };
});
afterAll(() => prisma.$disconnect());

const publish = (user, body) => request(app).post('/api/recipes').set(bearer(user)).send(body);

describe('POST /api/recipes (US-03)', () => {
  // AC1
  it('publishes a valid recipe', async () => {
    const res = await publish(author, payload);

    expect(res.status).toBe(201);
    expect(res.body.recipe).toMatchObject({
      title: 'Korenčkova juha',
      description: 'Kremna juha.',
      prepMinutes: 30,
      baseServings: 4,
      status: 'PUBLISHED',
      author: { id: author.id, name: 'Ana Avtorica' },
      category: { id: catalog.categories.soups.id, name: 'Juhe' },
    });
    expect(res.body.recipe.ingredients).toEqual(expect.arrayContaining([
      { ingredientId: catalog.ingredients.korenje.id, name: 'korenje', quantity: 0.6, unit: 'kg' },
      { ingredientId: catalog.ingredients.mleko.id, name: 'mleko', quantity: 200, unit: 'ml' },
    ]));
  });

  it('treats the description as optional', async () => {
    const { description: _omit, ...withoutDescription } = payload;
    const res = await publish(author, withoutDescription);

    expect(res.status).toBe(201);
    expect(res.body.recipe.description).toBeNull();
  });

  it('accepts a preparation time of 0 minutes', async () => {
    const res = await publish(author, { ...payload, prepMinutes: 0 });
    expect(res.status).toBe(201);
  });

  it.each([
    ['blank title', { title: '  ' }, 'body.title'],
    ['blank instructions', { instructions: '' }, 'body.instructions'],
    ['negative prep time', { prepMinutes: -1 }, 'body.prepMinutes'],
    ['fractional prep time', { prepMinutes: 12.5 }, 'body.prepMinutes'],
    ['zero servings', { baseServings: 0 }, 'body.baseServings'],
    ['fractional servings', { baseServings: 1.5 }, 'body.baseServings'],
    ['no ingredients', { ingredients: [] }, 'body.ingredients'],
    ['malformed category id', { categoryId: 'juhe' }, 'body.categoryId'],
  ])('rejects %s', async (_case, override, field) => {
    const res = await publish(author, { ...payload, ...override });

    expect(res.status).toBe(400);
    expect(res.body.error.details.map((d) => d.field)).toContain(field);
    expect(await prisma.recipe.count()).toBe(0);
  });

  it('rejects a category that does not exist', async () => {
    const res = await publish(author, { ...payload, categoryId: crypto.randomUUID() });

    expect(res.status).toBe(400);
    expect(res.body.error.details).toEqual([{ field: 'body.categoryId', message: 'Kategorija ne obstaja.' }]);
    expect(await prisma.recipe.count()).toBe(0);
  });

  // AC2
  it.each([
    ['zero quantity', { quantity: 0 }, 'body.ingredients.0.quantity'],
    ['negative quantity', { quantity: -5 }, 'body.ingredients.0.quantity'],
    ['unsupported unit', { unit: 'skodelica' }, 'body.ingredients.0.unit'],
  ])('rejects an ingredient with %s', async (_case, override, field) => {
    const ingredients = [{ ...payload.ingredients[0], ...override }];
    const res = await publish(author, { ...payload, ingredients });

    expect(res.status).toBe(400);
    expect(res.body.error.details.map((d) => d.field)).toContain(field);
  });

  it('rejects an ingredient that is not in the ingredient list', async () => {
    const ingredients = [{ ingredientId: crypto.randomUUID(), quantity: 1, unit: 'kos' }];
    const res = await publish(author, { ...payload, ingredients });

    expect(res.status).toBe(400);
    expect(res.body.error.details.map((d) => d.field)).toEqual(['body.ingredients.0.ingredientId']);
    expect(await prisma.recipe.count()).toBe(0);
  });

  it('rejects a duplicated ingredient and unit combination', async () => {
    const korenje = catalog.ingredients.korenje.id;
    const res = await publish(author, {
      ...payload,
      ingredients: [
        { ingredientId: korenje, quantity: 1, unit: 'kg' },
        { ingredientId: korenje, quantity: 2, unit: 'kg' },
      ],
    });

    expect(res.status).toBe(400);
    expect(res.body.error.details.map((d) => d.field)).toContain('body.ingredients.1.ingredientId');
  });

  it('allows the same ingredient with different units', async () => {
    const korenje = catalog.ingredients.korenje.id;
    const res = await publish(author, {
      ...payload,
      ingredients: [
        { ingredientId: korenje, quantity: 1, unit: 'kg' },
        { ingredientId: korenje, quantity: 2, unit: 'kos' },
      ],
    });
    expect(res.status).toBe(201);
  });

  // AC3 (public list is covered with US-04)
  it('makes the published recipe publicly readable', async () => {
    const { body } = await publish(author, payload);

    const res = await request(app).get(`/api/recipes/${body.recipe.id}`);

    expect(res.status).toBe(200);
    expect(res.body.recipe.title).toBe('Korenčkova juha');
  });

  // US-02 AC4
  it('forbids USER and ADMIN accounts and rejects guests', async () => {
    const user = await createUser({ role: 'USER' });
    const admin = await createUser({ role: 'ADMIN' });

    expect((await publish(user, payload)).status).toBe(403);
    expect((await publish(admin, payload)).status).toBe(403);
    expect((await request(app).post('/api/recipes').send(payload)).status).toBe(401);
    expect(await prisma.recipe.count()).toBe(0);
  });
});

describe('PATCH /api/recipes/:id (US-03 AC4)', () => {
  let recipe;
  beforeEach(async () => {
    recipe = await createRecipe(author, catalog.categories.soups, {
      ingredients: [[catalog.ingredients.korenje, 500, 'g']],
    });
  });

  const edit = (user, body, id = recipe.id) => request(app).patch(`/api/recipes/${id}`).set(bearer(user)).send(body);

  it('lets the author update fields and replace ingredients', async () => {
    const res = await edit(author, {
      title: 'Juha s testeninami',
      categoryId: catalog.categories.desserts.id,
      ingredients: [{ ingredientId: catalog.ingredients.testenine.id, quantity: 100, unit: 'g' }],
    });

    expect(res.status).toBe(200);
    expect(res.body.recipe).toMatchObject({
      title: 'Juha s testeninami',
      instructions: 'Skuhaj in zmiksaj.',
      category: { name: 'Sladice' },
      ingredients: [{ name: 'testenine', quantity: 100, unit: 'g' }],
    });
    expect(await prisma.recipeIngredient.count({ where: { recipeId: recipe.id } })).toBe(1);
  });

  it('keeps ingredients untouched when they are not sent', async () => {
    const res = await edit(author, { prepMinutes: 45 });

    expect(res.status).toBe(200);
    expect(res.body.recipe.ingredients).toEqual([
      { ingredientId: catalog.ingredients.korenje.id, name: 'korenje', quantity: 500, unit: 'g' },
    ]);
  });

  it('applies the same validation as publishing', async () => {
    const res = await edit(author, { baseServings: 0, ingredients: [] });

    expect(res.status).toBe(400);
    expect((await prisma.recipe.findUnique({ where: { id: recipe.id } })).baseServings).toBe(2);
  });

  it("rejects editing another author's recipe", async () => {
    const otherAuthor = await createUser({ role: 'AUTHOR' });

    const res = await edit(otherAuthor, { title: 'Ukradeno' });

    expect(res.status).toBe(403);
    expect((await prisma.recipe.findUnique({ where: { id: recipe.id } })).title).toBe('Korenčkova juha');
  });

  it('rejects an author who was demoted to USER', async () => {
    await prisma.user.update({ where: { id: author.id }, data: { role: 'USER' } });
    expect((await edit(author, { title: 'Novo' })).status).toBe(403);
  });

  it('returns 404 for an unknown recipe', async () => {
    expect((await edit(author, { title: 'Novo' }, crypto.randomUUID())).status).toBe(404);
  });
});

describe('GET /api/recipes/:id visibility', () => {
  it('hides a HIDDEN recipe from everyone except its author', async () => {
    const hidden = await createRecipe(author, catalog.categories.soups, { status: 'HIDDEN' });
    const other = await createUser();

    expect((await request(app).get(`/api/recipes/${hidden.id}`)).status).toBe(404);
    expect((await request(app).get(`/api/recipes/${hidden.id}`).set(bearer(other))).status).toBe(404);
    expect((await request(app).get(`/api/recipes/${hidden.id}`).set(bearer(author))).status).toBe(200);
  });

  it('returns 404 for a malformed id', async () => {
    expect((await request(app).get('/api/recipes/ni-uuid')).status).toBe(404);
  });
});

describe('catalog endpoints', () => {
  it('lists categories and ingredients alphabetically without login', async () => {
    const categories = await request(app).get('/api/categories');
    const ingredients = await request(app).get('/api/ingredients');

    expect(categories.body.categories.map((c) => c.name)).toEqual(['Juhe', 'Sladice']);
    expect(ingredients.body.ingredients.map((i) => i.name)).toEqual(['jajca', 'korenje', 'mleko', 'testenine']);
  });
});

describe('GET /api/recipes/mine', () => {
  it("lists only the author's own recipes, including hidden ones", async () => {
    const other = await createUser({ role: 'AUTHOR' });
    await createRecipe(author, catalog.categories.soups, { title: 'Moja juha' });
    await createRecipe(author, catalog.categories.soups, { title: 'Moja skrita', status: 'HIDDEN' });
    await createRecipe(other, catalog.categories.soups, { title: 'Tuja juha' });

    const res = await request(app).get('/api/recipes/mine').set(bearer(author));

    expect(res.status).toBe(200);
    expect(res.body.recipes.map((r) => r.title).sort()).toEqual(['Moja juha', 'Moja skrita']);
  });

  it('is available to authors only', async () => {
    const user = await createUser();
    expect((await request(app).get('/api/recipes/mine').set(bearer(user))).status).toBe(403);
  });
});
