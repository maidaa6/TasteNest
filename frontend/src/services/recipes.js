import { api } from './api.js';

export const UNITS = ['g', 'kg', 'ml', 'l', 'kos'];

export const getCategories = () => api('/categories').then((res) => res.categories);
export const getIngredients = () => api('/ingredients').then((res) => res.ingredients);

/** Accepts both "0,5" and "0.5"; returns NaN for anything that is not a plain number. */
export function parseNumber(value) {
  const normalized = String(value).trim().replace(',', '.');
  return normalized === '' || !/^-?\d*\.?\d+$/.test(normalized) ? NaN : Number(normalized);
}

export const emptyIngredientLine = () => ({ key: crypto.randomUUID(), ingredientId: '', quantity: '', unit: 'g' });

export const emptyRecipeForm = () => ({
  title: '',
  description: '',
  instructions: '',
  categoryId: '',
  prepMinutes: '',
  baseServings: '',
  ingredients: [emptyIngredientLine()],
});

export function recipeToForm(recipe) {
  return {
    title: recipe.title,
    description: recipe.description ?? '',
    instructions: recipe.instructions,
    categoryId: recipe.category.id,
    prepMinutes: String(recipe.prepMinutes),
    baseServings: String(recipe.baseServings),
    ingredients: recipe.ingredients.map((line) => ({
      key: crypto.randomUUID(),
      ingredientId: line.ingredientId,
      quantity: String(line.quantity).replace('.', ','),
      unit: line.unit,
    })),
  };
}

/** Client-side mirror of the API rules. Keys match the API field paths without the "body." prefix. */
export function validateRecipeForm(form) {
  const errors = {};
  if (!form.title.trim()) errors.title = 'Naslov je obvezen.';
  if (!form.instructions.trim()) errors.instructions = 'Postopek je obvezen.';
  if (!form.categoryId) errors.categoryId = 'Izberite kategorijo.';

  const prep = parseNumber(form.prepMinutes);
  if (!Number.isInteger(prep) || prep < 0) errors.prepMinutes = 'Vnesite celo število minut (0 ali več).';

  const servings = parseNumber(form.baseServings);
  if (!Number.isInteger(servings) || servings < 1) errors.baseServings = 'Vnesite pozitivno celo število porcij.';

  if (!form.ingredients.length) errors.ingredients = 'Recept potrebuje vsaj eno sestavino.';

  const seen = new Set();
  form.ingredients.forEach((line, index) => {
    if (!line.ingredientId) errors[`ingredients.${index}.ingredientId`] = 'Izberite sestavino.';
    if (!(parseNumber(line.quantity) > 0)) errors[`ingredients.${index}.quantity`] = 'Količina mora biti pozitivna.';

    const key = `${line.ingredientId}:${line.unit}`;
    if (line.ingredientId && seen.has(key)) {
      errors[`ingredients.${index}.ingredientId`] = 'Sestavina s to enoto je že navedena.';
    }
    seen.add(key);
  });

  return errors;
}

export function formToPayload(form) {
  return {
    title: form.title.trim(),
    description: form.description.trim() || null,
    instructions: form.instructions.trim(),
    categoryId: form.categoryId,
    prepMinutes: parseNumber(form.prepMinutes),
    baseServings: parseNumber(form.baseServings),
    ingredients: form.ingredients.map(({ ingredientId, quantity, unit }) => ({
      ingredientId,
      quantity: parseNumber(quantity),
      unit,
    })),
  };
}

export const SEARCH_FILTERS = ['q', 'categoryId', 'ingredientId', 'maxPrepMinutes'];

export function searchRecipes(filters, { signal } = {}) {
  const params = new URLSearchParams();
  for (const key of SEARCH_FILTERS) {
    const value = filters[key]?.trim();
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return api(`/recipes${query ? `?${query}` : ''}`, { signal }).then((res) => res.recipes);
}
