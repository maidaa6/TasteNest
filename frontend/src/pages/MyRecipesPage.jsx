import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import Icon from '../components/Icon.jsx';
import RecipeImage from '../components/RecipeImage.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatServings } from '../services/format.js';

const STATUS_LABEL = { PUBLISHED: 'Objavljen', HIDDEN: 'Umaknjen' };

export default function MyRecipesPage() {
  const { request } = useAuth();
  const location = useLocation();
  const [recipes, setRecipes] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    request('/recipes/mine')
      .then((res) => active && setRecipes(res.recipes))
      .catch((err) => active && setError(err.message));
    return () => { active = false; };
  }, [request]);

  return (
    <section>
      <div className="page-header">
        <div>
          <p className="eyebrow">Avtorski kotiček</p>
          <h1>Moji recepti</h1>
        </div>
        <Link to="/recepti/nov" className="button"><Icon name="plus" size={18} />Nov recept</Link>
      </div>

      {location.state?.message && <p className="alert alert-success" role="status">{location.state.message}</p>}
      {error && <p className="alert" role="alert">{error}</p>}
      {!recipes && !error && <p className="muted">Nalaganje …</p>}
      {recipes?.length === 0 && (
        <div className="empty-state">
          <span className="empty-state-icon"><Icon name="pot" size={40} strokeWidth={1.4} /></span>
          <p className="muted">Objavili še niste nobenega recepta.</p>
        </div>
      )}

      {recipes?.length > 0 && (
        <ul className="recipe-table">
          {recipes.map((recipe) => (
            <li key={recipe.id} className="recipe-table-row">
              <RecipeImage recipe={recipe} className="recipe-thumb" />
              <div className="recipe-table-main">
                <Link to={`/recepti/${recipe.id}`} className="recipe-table-title">{recipe.title}</Link>
                <div className="muted">
                  {recipe.category.name} · {recipe.prepMinutes} min · {formatServings(recipe.baseServings)}
                </div>
              </div>
              <span className={`badge badge-${recipe.status.toLowerCase()}`}>{STATUS_LABEL[recipe.status]}</span>
              <Link to={`/recepti/${recipe.id}/uredi`} className="button button-ghost" aria-label={`Uredi ${recipe.title}`}>
                <Icon name="edit" size={16} />Uredi
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
