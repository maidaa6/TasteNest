import { prisma } from '../../src/db.js';

export async function createCatalog() {
  const [soups, desserts] = await Promise.all([
    prisma.category.create({ data: { name: 'Juhe' } }),
    prisma.category.create({ data: { name: 'Sladice' } }),
  ]);
  const names = ['testenine', 'korenje', 'mleko', 'jajca'];
  const ingredients = {};
  for (const name of names) {
    ingredients[name] = await prisma.ingredient.create({ data: { name } });
  }
  return { categories: { soups, desserts }, ingredients };
}

export function createRecipe(author, category, { ingredients = [], ...overrides } = {}) {
  return prisma.recipe.create({
    data: {
      title: 'Korenčkova juha',
      instructions: 'Skuhaj in zmiksaj.',
      baseServings: 2,
      prepMinutes: 30,
      authorId: author.id,
      categoryId: category.id,
      ...overrides,
      ingredients: {
        create: ingredients.map(([ingredient, quantity, unit]) => ({ ingredientId: ingredient.id, quantity, unit })),
      },
    },
  });
}
