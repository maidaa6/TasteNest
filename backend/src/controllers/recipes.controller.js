import * as recipeService from '../services/recipe.service.js';

export async function create(req, res) {
  const recipe = await recipeService.createRecipe(req.user.id, req.valid.body);
  res.status(201).json({ recipe });
}

export async function update(req, res) {
  const recipe = await recipeService.updateRecipe(req.user, req.params.id, req.valid.body);
  res.json({ recipe });
}

export async function get(req, res) {
  res.json({ recipe: await recipeService.getRecipe(req.params.id, req.user) });
}

export async function listMine(req, res) {
  res.json({ recipes: await recipeService.listAuthorRecipes(req.user.id) });
}
