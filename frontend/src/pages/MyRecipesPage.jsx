import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';

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
        <h1>Moji recepti</h1>
        <Link to="/recepti/nov" className="button">Nov recept</Link>
      </div>

      {location.state?.message && <p className="alert alert-success" role="status">{location.state.message}</p>}
      {error && <p className="alert" role="alert">{error}</p>}
      {!recipes && !error && <p className="muted">Nalaganje …</p>}
      {recipes?.length === 0 && <p className="muted">Objavili še niste nobenega recepta.</p>}

      {recipes?.length > 0 && (
        <ul className="recipe-table">
          {recipes.map((recipe) => (
            <li key={recipe.id} className="card recipe-table-row">
              <div>
                <strong>{recipe.title}</strong>
                <div className="muted">
                  {recipe.category.name} · {recipe.prepMinutes} min · {recipe.baseServings} porcij
                </div>
              </div>
              <span className={`badge badge-${recipe.status.toLowerCase()}`}>{STATUS_LABEL[recipe.status]}</span>
              <Link to={`/recepti/${recipe.id}/uredi`} aria-label={`Uredi ${recipe.title}`}>Uredi</Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
