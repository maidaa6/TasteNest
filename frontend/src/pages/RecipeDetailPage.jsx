import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';
import { formatQuantity, formatServings } from '../services/format.js';

export default function RecipeDetailPage() {
  const { id } = useParams();
  const { user, request } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setRecipe(null);
    setError(null);
    // Authenticated when possible so authors can still open their own hidden recipes.
    request(`/recipes/${id}`)
      .then((res) => active && setRecipe(res.recipe))
      .catch((err) => active && setError(err));
    return () => { active = false; };
  }, [id, request]);

  if (error) {
    return (
      <section>
        <h1>{error.status === 404 ? 'Recept ne obstaja' : 'Napaka'}</h1>
        <p className="muted">{error.status === 404 ? 'Recept je bil morda umaknjen.' : error.message}</p>
        <p><Link to="/">Nazaj na recepte</Link></p>
      </section>
    );
  }
  if (!recipe) return <p className="muted">Nalaganje …</p>;

  const isOwner = user?.id === recipe.author.id;

  return (
    <article className="recipe-detail">
      <p><Link to="/">← Vsi recepti</Link></p>

      <div className="recipe-detail-grid">
        <section className="card">
          <span className="recipe-card-category">{recipe.category.name}</span>
          <h1>{recipe.title}</h1>
          <p className="muted">
            Avtor: {recipe.author.name} · {recipe.prepMinutes} min · {formatServings(recipe.baseServings)}
          </p>
          {recipe.status === 'HIDDEN' && (
            <p className="alert">Recept je umaknjen in ni javno viden.</p>
          )}
          {recipe.description && <p>{recipe.description}</p>}

          <h2>Sestavine</h2>
          <ul className="ingredient-list">
            {recipe.ingredients.map((line) => (
              <li key={`${line.ingredientId}:${line.unit}`}>
                {formatQuantity(line.quantity)} {line.unit} {line.name}
              </li>
            ))}
          </ul>

          {isOwner && <Link className="button button-secondary" to={`/recepti/${recipe.id}/uredi`}>Uredi recept</Link>}
        </section>

        <section className="card">
          <h2>Postopek priprave</h2>
          <p className="instructions">{recipe.instructions}</p>
        </section>
      </div>
    </article>
  );
}
