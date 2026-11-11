import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import FormField from '../components/FormField.jsx';
import IngredientFields from '../components/IngredientFields.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { fieldErrorsFromApi } from '../services/formErrors.js';
import {
  emptyRecipeForm,
  formToPayload,
  getCategories,
  getIngredients,
  recipeToForm,
  validateRecipeForm,
} from '../services/recipes.js';

export default function RecipeFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { request } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyRecipeForm);
  const [options, setOptions] = useState({ categories: [], ingredients: [] });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      getCategories(),
      getIngredients(),
      isEdit ? request(`/recipes/${id}`) : null,
    ])
      .then(([categories, ingredients, existing]) => {
        if (!active) return;
        setOptions({ categories, ingredients });
        if (existing) setForm(recipeToForm(existing.recipe));
      })
      .catch((err) => active && setLoadError(err.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id, isEdit, request]);

  const onFieldChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);

    const clientErrors = validateRecipeForm(form);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) return;

    setSubmitting(true);
    try {
      const body = formToPayload(form);
      const { recipe } = isEdit
        ? await request(`/recipes/${id}`, { method: 'PATCH', body })
        : await request('/recipes', { method: 'POST', body });
      navigate('/moji-recepti', {
        state: { message: isEdit ? `Recept »${recipe.title}« je posodobljen.` : `Recept »${recipe.title}« je objavljen.` },
      });
    } catch (err) {
      const serverErrors = fieldErrorsFromApi(err.details);
      setErrors(serverErrors);
      if (!Object.keys(serverErrors).length) setFormError(err.message);
      setSubmitting(false);
    }
  };

  const title = isEdit ? 'Urejanje recepta' : 'Nov recept';

  if (loading) return <p className="muted">Nalaganje …</p>;
  if (loadError) {
    return (
      <section>
        <h1>{title}</h1>
        <p className="alert" role="alert">{loadError}</p>
      </section>
    );
  }

  return (
    <section className="form-page">
      <Link to="/moji-recepti" className="back-link">← Moji recepti</Link>
      <h1>{title}</h1>
      <p className="muted">Polja brez oznake »neobvezno« so obvezna.</p>
      <form className="form form-wide" onSubmit={onSubmit} noValidate>
        {formError && <p className="alert" role="alert">{formError}</p>}
        {Object.keys(errors).some((k) => errors[k]) && (
          <p className="alert" role="alert">Preverite označena polja.</p>
        )}

        <div className="form-section">
          <h2 className="form-section-title">Osnovni podatki</h2>
          <FormField label="Naslov" name="title" value={form.title} onChange={onFieldChange} error={errors.title} />
          <FormField label="Kratek opis (neobvezno)" name="description" as="textarea" rows={2}
            value={form.description} onChange={onFieldChange} error={errors.description} />

          <div className="form-row">
            <FormField label="Kategorija" name="categoryId" as="select"
              value={form.categoryId} onChange={onFieldChange} error={errors.categoryId}>
              <option value="">Izberite kategorijo</option>
              {options.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </FormField>
            <FormField label="Čas priprave (min)" name="prepMinutes" inputMode="numeric"
              value={form.prepMinutes} onChange={onFieldChange} error={errors.prepMinutes} />
            <FormField label="Število porcij" name="baseServings" inputMode="numeric"
              value={form.baseServings} onChange={onFieldChange} error={errors.baseServings} />
          </div>
        </div>

        <IngredientFields
          lines={form.ingredients}
          ingredients={options.ingredients}
          errors={errors}
          onChange={(ingredients) => {
            setForm((prev) => ({ ...prev, ingredients }));
            setErrors({});
          }}
        />

        <div className="form-section">
          <h2 className="form-section-title">Priprava</h2>
          <FormField label="Postopek" name="instructions" as="textarea" rows={8}
            placeholder="Vsak korak v svojo vrstico."
            value={form.instructions} onChange={onFieldChange} error={errors.instructions} />
        </div>

        <div className="form-actions">
          <button className="button" type="submit" disabled={submitting}>
            {isEdit ? 'Shrani spremembe' : 'Objavi recept'}
          </button>
          <Link to="/moji-recepti" className="button button-secondary">Prekliči</Link>
        </div>
      </form>
    </section>
  );
}
