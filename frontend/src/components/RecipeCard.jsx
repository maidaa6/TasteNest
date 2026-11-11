import { Link } from 'react-router';
import { formatServings } from '../services/format.js';
import Icon from './Icon.jsx';
import RecipeImage from './RecipeImage.jsx';

export default function RecipeCard({ recipe }) {
  return (
    <article className="recipe-card">
      <div className="recipe-card-media">
        <RecipeImage recipe={recipe} />
        <span className="recipe-card-category">{recipe.category.name}</span>
      </div>
      <div className="recipe-card-body">
        <h2 className="recipe-card-title">{recipe.title}</h2>
        <p className="recipe-meta"><Icon name="clock" size={16} />{recipe.prepMinutes} min · {formatServings(recipe.baseServings)}</p>
        {recipe.description && <p className="recipe-card-description">{recipe.description}</p>}
        <Link
          to={`/recepti/${recipe.id}`}
          className="recipe-card-link"
          aria-label={`Odpri recept ${recipe.title}`}
        >
          Odpri recept <Icon name="arrowRight" size={16} />
        </Link>
      </div>
    </article>
  );
}
