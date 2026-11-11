import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { prisma, resetDatabase } from './helpers/db.js';
import { seed } from '../prisma/seed.js';
import { verifyPassword } from '../src/utils/password.js';

async function createRecipeFixture() {
  const author = await prisma.user.create({
    data: { name: 'Avtor', email: 'a@test.si', passwordHash: 'x', role: 'AUTHOR' },
  });
  const category = await prisma.category.create({ data: { name: 'Juhe' } });
  const ingredient = await prisma.ingredient.create({ data: { name: 'korenje' } });
  const recipe = await prisma.recipe.create({
    data: {
      title: 'Juha', instructions: 'Kuhaj.', baseServings: 2, prepMinutes: 10,
      authorId: author.id, categoryId: category.id,
    },
  });
  return { author, category, ingredient, recipe };
}

describe('database constraints', () => {
  beforeEach(resetDatabase);
  afterAll(() => prisma.$disconnect());

  it('allows one rating per user and recipe', async () => {
    const { author, recipe } = await createRecipeFixture();
    await prisma.rating.create({ data: { userId: author.id, recipeId: recipe.id, score: 3 } });

    await expect(
      prisma.rating.create({ data: { userId: author.id, recipeId: recipe.id, score: 5 } }),
    ).rejects.toMatchObject({ code: 'P2002' });
  });

  it('rejects scores outside 1–5', async () => {
    const { author, recipe } = await createRecipeFixture();
    await expect(
      prisma.rating.create({ data: { userId: author.id, recipeId: recipe.id, score: 6 } }),
    ).rejects.toThrow(/ratings_score_check/);
  });

  it('rejects non-positive servings and quantities', async () => {
    const { author, category, ingredient, recipe } = await createRecipeFixture();

    await expect(prisma.recipe.create({
      data: { title: 'X', instructions: 'X', baseServings: 0, prepMinutes: 0, authorId: author.id, categoryId: category.id },
    })).rejects.toThrow(/recipes_base_servings_check/);

    await expect(prisma.recipeIngredient.create({
      data: { recipeId: recipe.id, ingredientId: ingredient.id, quantity: 0, unit: 'g' },
    })).rejects.toThrow(/recipe_ingredients_quantity_check/);
  });

  it('allows the same ingredient in a recipe only once per unit', async () => {
    const { ingredient, recipe } = await createRecipeFixture();
    const row = { recipeId: recipe.id, ingredientId: ingredient.id, quantity: 100 };

    await prisma.recipeIngredient.create({ data: { ...row, unit: 'g' } });
    await prisma.recipeIngredient.create({ data: { ...row, unit: 'kos' } });
    await expect(prisma.recipeIngredient.create({ data: { ...row, unit: 'g' } }))
      .rejects.toMatchObject({ code: 'P2002' });
  });

  it('allows one meal plan per user and week', async () => {
    const { author } = await createRecipeFixture();
    const plan = { userId: author.id, weekStart: new Date('2026-11-02') };

    await prisma.mealPlan.create({ data: plan });
    await expect(prisma.mealPlan.create({ data: plan })).rejects.toMatchObject({ code: 'P2002' });
  });
});

describe('seed', () => {
  beforeEach(resetDatabase);

  const env = {
    ADMIN_EMAIL: 'Admin@TasteNest.local',
    ADMIN_PASSWORD: 'admin1234',
    DEMO_PASSWORD: 'demo-test-1234',
  };

  it('creates the first administrator with a hashed password', async () => {
    await seed(prisma, env);

    const admin = await prisma.user.findUnique({ where: { email: 'admin@tastenest.local' } });
    expect(admin.role).toBe('ADMIN');
    expect(admin.passwordHash).not.toContain('admin1234');
  });

  it('is idempotent', async () => {
    await seed(prisma, env);
    await seed(prisma, env);

    expect(await prisma.user.count()).toBe(3);
    expect(await prisma.recipe.count()).toBe(3);
    expect(await prisma.category.count()).toBe(6);
  });

  it('creates demo accounts with the password from DEMO_PASSWORD', async () => {
    await seed(prisma, env);

    const author = await prisma.user.findUnique({ where: { email: 'avtor@tastenest.local' } });
    expect(await verifyPassword('demo-test-1234', author.passwordHash)).toBe(true);
  });

  it('skips demo accounts and recipes when DEMO_PASSWORD is not set', async () => {
    const { DEMO_PASSWORD, ...withoutDemo } = env;
    await seed(prisma, withoutDemo);

    expect(await prisma.user.count()).toBe(1);
    expect(await prisma.recipe.count()).toBe(0);
    expect(await prisma.category.count()).toBe(6);
  });
});
