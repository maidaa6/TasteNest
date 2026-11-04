import { prisma } from '../db.js';

export const listCategories = () =>
  prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } });

export const listIngredients = () =>
  prisma.ingredient.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } });
