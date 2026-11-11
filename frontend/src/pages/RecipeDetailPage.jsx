import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import Icon from '../components/Icon.jsx';
import RecipeImage from '../components/RecipeImage.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatQuantity, formatServings, splitSteps } from '../services/format.js';

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
      <section className="message-page">
        <span className="message-page-icon"><Icon name="plate" size={44} strokeWidth={1.4} /></span>
        <h1>{error.status === 404 ? 'Recept ne obstaja' : 'Napaka'}</h1>
        <p className="muted">{error.status === 404 ? 'Recept je bil morda umaknjen.' : error.message}</p>
        <Link to="/" className="button button-secondary">Nazaj na recepte</Link>
      </section>
    );
  }

  if (!recipe) {
    return (
      <div className="recipe-detail" aria-busy="true">
        <span className="visually-hidden" role="status">Nalaganje …</span>
        <div className="recipe-hero" aria-hidden="true">
          <div className="recipe-image skeleton-media" />
          <div className="recipe-hero-info">
            <div className="skeleton-line wide" />
            <div className="skeleton-line" />
          </div>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === recipe.author.id;
  const steps = splitSteps(recipe.instructions);

  return (
    <article className="recipe-detail">
      <Link to="/" className="back-link"><Icon name="arrowLeft" size={18} /> Vsi recepti</Link>

      <div className="recipe-hero">
        <RecipeImage recipe={recipe} className="recipe-hero-image" eager />

        <div className="recipe-hero-info">
          <span className="tag">{recipe.category.name}</span>
          <h1>{recipe.title}</h1>
          {recipe.description && <p className="recipe-lead">{recipe.description}</p>}
          <p className="recipe-meta recipe-meta-large">
            <Icon name="chef" size={18} />Avtor: {recipe.author.name} · {recipe.prepMinutes} min · {formatServings(recipe.baseServings)}
          </p>

          {recipe.status === 'HIDDEN' && (
            <p className="alert">Recept je umaknjen in ni javno viden.</p>
          )}

          <div className="stats" aria-hidden="true">
            <div className="stat"><Icon name="clock" size={20} /><span>Priprava</span><strong>{recipe.prepMinutes} min</strong></div>
            <div className="stat"><Icon name="users" size={20} /><span>Porcije</span><strong>{recipe.baseServings}</strong></div>
            <div className="stat"><Icon name="leaf" size={20} /><span>Sestavine</span><strong>{recipe.ingredients.length}</strong></div>
          </div>

          {isOwner && (
            <Link className="button button-secondary" to={`/recepti/${recipe.id}/uredi`}>
              <Icon name="edit" size={18} />
              Uredi recept
            </Link>
          )}
        </div>
      </div>

      <div className="recipe-body">
        <section className="panel ingredients-panel">
          <h2>Sestavine</h2>
          <p className="muted panel-note">Za {formatServings(recipe.baseServings)}</p>
          <ul className="ingredient-list">
            {recipe.ingredients.map((line) => (
              <li key={`${line.ingredientId}:${line.unit}`}>
                {formatQuantity(line.quantity)} {line.unit} {line.name}
              </li>
            ))}
          </ul>
        </section>

        <section className="panel steps-panel">
          <h2>Postopek priprave</h2>
          <ol className="steps">
            {steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </section>
      </div>
    </article>
  );
}
