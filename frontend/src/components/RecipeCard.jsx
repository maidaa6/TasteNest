import { Link } from 'react-router';
import { formatServings } from '../services/format.js';

export default function RecipeCard({ recipe }) {
  return (
    <article className="card recipe-card">
      <span className="recipe-card-category">{recipe.category.name}</span>
      <h2 className="recipe-card-title">{recipe.title}</h2>
      <p className="muted">{recipe.prepMinutes} min · {formatServings(recipe.baseServings)}</p>
      {recipe.description && <p className="recipe-card-description">{recipe.description}</p>}
      <Link
        to={`/recepti/${recipe.id}`}
        className="button button-secondary recipe-card-action"
        aria-label={`Odpri recept ${recipe.title}`}
      >
        Odpri recept
      </Link>
    </article>
  );
}
