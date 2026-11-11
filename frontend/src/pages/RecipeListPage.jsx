import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import Icon from '../components/Icon.jsx';
import RecipeCard from '../components/RecipeCard.jsx';
import { formatRecipeCount } from '../services/format.js';
import { SEARCH_FILTERS, getCategories, getIngredients, searchRecipes } from '../services/recipes.js';

const PREP_TIME_OPTIONS = [15, 30, 45, 60, 90];

/** Filters live in the URL so a search can be bookmarked, shared and navigated back to. */
export default function RecipeListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = Object.fromEntries(SEARCH_FILTERS.map((key) => [key, searchParams.get(key) ?? '']));
  const filtersKey = searchParams.toString();

  const [query, setQuery] = useState(filters.q);
  const [options, setOptions] = useState({ categories: [], ingredients: [] });
  const [recipes, setRecipes] = useState(null);
  const [error, setError] = useState(null);

  // Keep the text box in sync when the URL changes through back/forward navigation.
  useEffect(() => setQuery(filters.q), [filters.q]);

  useEffect(() => {
    Promise.all([getCategories(), getIngredients()])
      .then(([categories, ingredients]) => setOptions({ categories, ingredients }))
      .catch(() => { /* filters stay empty; the list itself reports API errors */ });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setError(null);
    searchRecipes(Object.fromEntries(new URLSearchParams(filtersKey)), { signal: controller.signal })
      .then(setRecipes)
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message);
      });
    return () => controller.abort();
  }, [filtersKey]);

  const applyFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const onSearch = (event) => {
    event.preventDefault();
    applyFilter('q', query.trim());
  };

  const clearFilters = () => {
    setQuery('');
    setSearchParams({});
  };

  const hasFilters = SEARCH_FILTERS.some((key) => filters[key]);

  return (
    <section className="recipe-list-page">
      <header className="hero">
        <p className="eyebrow">Kaj bomo kuhali danes?</p>
        <h1>Raziskuj recepte</h1>
        <p className="hero-lead">
          Poišči jed po nazivu, sestavini, ki jo imaš doma, ali času, ki ga imaš na voljo.
        </p>

        <form className="search" role="search" onSubmit={onSearch}>
          <Icon name="search" size={20} className="search-icon" />
          <input
            type="search"
            aria-label="Iskanje po nazivu"
            placeholder="Npr. juha, palačinke, testenine …"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="button" type="submit">Išči</button>
        </form>
      </header>

      <div className="filters">
        <div className="chips" role="group" aria-label="Kategorija">
          <button
            type="button"
            className="chip"
            aria-pressed={!filters.categoryId}
            onClick={() => applyFilter('categoryId', '')}
          >
            Vse
          </button>
          {options.categories.map((c) => (
            <button
              key={c.id}
              type="button"
              className="chip"
              aria-pressed={filters.categoryId === c.id}
              onClick={() => applyFilter('categoryId', filters.categoryId === c.id ? '' : c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="filter-selects">
          <label className="select-field">
            <span>Sestavina</span>
            <select value={filters.ingredientId} onChange={(e) => applyFilter('ingredientId', e.target.value)}>
              <option value="">vse</option>
              {options.ingredients.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </label>
          <label className="select-field">
            <span>Čas priprave</span>
            <select value={filters.maxPrepMinutes} onChange={(e) => applyFilter('maxPrepMinutes', e.target.value)}>
              <option value="">brez omejitve</option>
              {PREP_TIME_OPTIONS.map((m) => <option key={m} value={m}>do {m} min</option>)}
            </select>
          </label>
          {hasFilters && (
            <button type="button" className="text-button" onClick={clearFilters}>
              <Icon name="close" size={16} />
              Počisti filtre
            </button>
          )}
        </div>
      </div>

      {error && <p className="alert" role="alert">{error}</p>}

      {!recipes && !error && (
        <div className="recipe-grid" aria-busy="true">
          <span className="visually-hidden" role="status">Nalaganje …</span>
          {[0, 1, 2].map((n) => (
            <div key={n} className="recipe-card skeleton" aria-hidden="true">
              <div className="skeleton-media" />
              <div className="recipe-card-body">
                <div className="skeleton-line wide" />
                <div className="skeleton-line" />
              </div>
            </div>
          ))}
        </div>
      )}

      {recipes?.length === 0 && (
        <div className="empty-state">
          <span className="empty-state-icon"><Icon name="bowl" size={40} strokeWidth={1.4} /></span>
          <p className="empty-state-title">Ni najdenih receptov</p>
          <p className="muted">Poskusite z drugim iskalnim nizom ali odstranite kakšen filter.</p>
          {hasFilters && <button type="button" className="button button-secondary" onClick={clearFilters}>Prikaži vse recepte</button>}
        </div>
      )}

      {recipes?.length > 0 && (
        <>
          <p className="result-count muted" aria-live="polite">{formatRecipeCount(recipes.length)}</p>
          <div className="recipe-grid">
            {recipes.map((recipe, index) => (
              <div key={recipe.id} className="reveal" style={{ '--reveal-delay': `${Math.min(index, 8) * 60}ms` }}>
                <RecipeCard recipe={recipe} />
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
