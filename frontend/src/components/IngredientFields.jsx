import { UNITS, emptyIngredientLine } from '../services/recipes.js';

export default function IngredientFields({ lines, ingredients, errors, onChange }) {
  const update = (key, field, value) =>
    onChange(lines.map((line) => (line.key === key ? { ...line, [field]: value } : line)));

  const remove = (key) => onChange(lines.filter((line) => line.key !== key));

  return (
    <fieldset className="ingredients">
      <legend>Sestavine</legend>
      {errors.ingredients && <p className="field-error">{errors.ingredients}</p>}

      {lines.map((line, index) => {
        const ingredientError = errors[`ingredients.${index}.ingredientId`];
        const quantityError = errors[`ingredients.${index}.quantity`];
        const unitError = errors[`ingredients.${index}.unit`];
        const n = index + 1;

        return (
          <div className="ingredient-row" key={line.key}>
            <select
              aria-label={`Sestavina ${n}`}
              aria-invalid={ingredientError ? true : undefined}
              value={line.ingredientId}
              onChange={(e) => update(line.key, 'ingredientId', e.target.value)}
            >
              <option value="">Izberite sestavino</option>
              {ingredients.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
            <input
              aria-label={`Količina ${n}`}
              aria-invalid={quantityError ? true : undefined}
              inputMode="decimal"
              value={line.quantity}
              onChange={(e) => update(line.key, 'quantity', e.target.value)}
            />
            <select
              aria-label={`Enota ${n}`}
              value={line.unit}
              onChange={(e) => update(line.key, 'unit', e.target.value)}
            >
              {UNITS.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
            </select>
            <button
              type="button"
              className="button button-secondary"
              aria-label={`Odstrani sestavino ${n}`}
              onClick={() => remove(line.key)}
            >
              ×
            </button>
            {[ingredientError, quantityError, unitError].filter(Boolean).map((message) => (
              <span key={message} className="field-error ingredient-error">{message}</span>
            ))}
          </div>
        );
      })}

      <button type="button" className="button button-secondary" onClick={() => onChange([...lines, emptyIngredientLine()])}>
        Dodaj sestavino
      </button>
    </fieldset>
  );
}
