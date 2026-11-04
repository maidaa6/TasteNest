import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import RecipeCard from '../components/RecipeCard.jsx';
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
    <section>
      <h1>Raziskuj recepte</h1>

      <form className="search" role="search" onSubmit={onSearch}>
        <input
          type="search"
          aria-label="Iskanje po nazivu"
          placeholder="Iskanje po nazivu …"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="button" type="submit">Išči</button>
      </form>

      <div className="card filters">
        <label>
          Kategorija
          <select value={filters.categoryId} onChange={(e) => applyFilter('categoryId', e.target.value)}>
            <option value="">vse</option>
            {options.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label>
          Sestavina
          <select value={filters.ingredientId} onChange={(e) => applyFilter('ingredientId', e.target.value)}>
            <option value="">vse</option>
            {options.ingredients.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </label>
        <label>
          Čas priprave
          <select value={filters.maxPrepMinutes} onChange={(e) => applyFilter('maxPrepMinutes', e.target.value)}>
            <option value="">brez omejitve</option>
            {PREP_TIME_OPTIONS.map((m) => <option key={m} value={m}>do {m} min</option>)}
          </select>
        </label>
        {hasFilters && (
          <button type="button" className="link-button filters-clear" onClick={clearFilters}>Počisti filtre</button>
        )}
      </div>

      {error && <p className="alert" role="alert">{error}</p>}
      {!recipes && !error && <p className="muted">Nalaganje …</p>}
      {recipes?.length === 0 && <p className="empty-state">Ni najdenih receptov</p>}
      {recipes?.length > 0 && (
        <div className="recipe-grid">
          {recipes.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}
        </div>
      )}
    </section>
  );
}
