import { prisma } from '../db.js';
import { badRequest, forbidden, notFound } from '../utils/httpError.js';
import { isUuid } from '../utils/ids.js';

const RECIPE_NOT_FOUND = 'Recept ne obstaja.';

const recipeInclude = {
  author: { select: { id: true, name: true } },
  category: { select: { id: true, name: true } },
  ingredients: {
    include: { ingredient: { select: { name: true } } },
    orderBy: { ingredient: { name: 'asc' } },
  },
};

export function toRecipeDto(recipe) {
  return {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    instructions: recipe.instructions,
    baseServings: recipe.baseServings,
    prepMinutes: recipe.prepMinutes,
    status: recipe.status,
    createdAt: recipe.createdAt,
    updatedAt: recipe.updatedAt,
    author: recipe.author,
    category: recipe.category,
    ingredients: recipe.ingredients.map((line) => ({
      ingredientId: line.ingredientId,
      name: line.ingredient.name,
      quantity: line.quantity.toNumber(),
      unit: line.unit,
    })),
  };
}

// Foreign keys would reject unknown ids too, but only with a generic error;
// checking first lets the client highlight the exact field.
async function assertReferencesExist({ categoryId, ingredients }) {
  const details = [];

  if (categoryId) {
    const category = await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } });
    if (!category) details.push({ field: 'body.categoryId', message: 'Kategorija ne obstaja.' });
  }

  if (ingredients) {
    const ids = [...new Set(ingredients.map((line) => line.ingredientId))];
    const known = new Set(
      (await prisma.ingredient.findMany({ where: { id: { in: ids } }, select: { id: true } })).map((i) => i.id),
    );
    ingredients.forEach((line, index) => {
      if (!known.has(line.ingredientId)) {
        details.push({ field: `body.ingredients.${index}.ingredientId`, message: 'Sestavina ne obstaja.' });
      }
    });
  }

  if (details.length) throw badRequest('Neveljavni podatki.', details);
}

export async function createRecipe(authorId, data) {
  await assertReferencesExist(data);
  const { ingredients, ...fields } = data;

  const recipe = await prisma.recipe.create({
    data: { ...fields, authorId, ingredients: { create: ingredients } },
    include: recipeInclude,
  });
  return toRecipeDto(recipe);
}

export async function updateRecipe(user, id, data) {
  const existing = isUuid(id)
    ? await prisma.recipe.findUnique({ where: { id }, select: { authorId: true } })
    : null;
  if (!existing) throw notFound(RECIPE_NOT_FOUND);
  if (existing.authorId !== user.id) throw forbidden('Urejate lahko samo svoje recepte.');

  await assertReferencesExist(data);
  const { ingredients, ...fields } = data;

  // Ingredients are replaced as a whole; nested writes run in one transaction.
  const recipe = await prisma.recipe.update({
    where: { id },
    data: {
      ...fields,
      ...(ingredients && { ingredients: { deleteMany: {}, create: ingredients } }),
    },
    include: recipeInclude,
  });
  return toRecipeDto(recipe);
}

/** Published recipes are public; hidden ones remain visible to their author only. */
export async function getRecipe(id, viewer) {
  const recipe = isUuid(id) ? await prisma.recipe.findUnique({ where: { id }, include: recipeInclude }) : null;
  if (!recipe || (recipe.status !== 'PUBLISHED' && recipe.authorId !== viewer?.id)) {
    throw notFound(RECIPE_NOT_FOUND);
  }
  return toRecipeDto(recipe);
}

const summarySelect = {
  id: true,
  title: true,
  description: true,
  prepMinutes: true,
  baseServings: true,
  createdAt: true,
  author: { select: { id: true, name: true } },
  category: { select: { id: true, name: true } },
};

/** Public search: published recipes only; all given filters must match. */
export function searchRecipes({ q, ingredientId, categoryId, maxPrepMinutes }) {
  return prisma.recipe.findMany({
    where: {
      status: 'PUBLISHED',
      ...(q && { title: { contains: q, mode: 'insensitive' } }),
      ...(categoryId && { categoryId }),
      ...(ingredientId && { ingredients: { some: { ingredientId } } }),
      ...(maxPrepMinutes !== undefined && { prepMinutes: { lte: maxPrepMinutes } }),
    },
    select: summarySelect,
    orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
  });
}

export async function listAuthorRecipes(authorId) {
  const recipes = await prisma.recipe.findMany({
    where: { authorId },
    include: recipeInclude,
    orderBy: { createdAt: 'desc' },
  });
  return recipes.map(toRecipeDto);
}
