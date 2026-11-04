import { describe, expect, it } from 'vitest';
import { emptyRecipeForm, formToPayload, parseNumber, validateRecipeForm } from './recipes.js';

const validForm = () => ({
  ...emptyRecipeForm(),
  title: ' Juha ',
  instructions: 'Kuhaj.',
  categoryId: 'cat-1',
  prepMinutes: '0',
  baseServings: '4',
  ingredients: [{ key: 'a', ingredientId: 'ing-1', quantity: '0,5', unit: 'kg' }],
});

describe('parseNumber', () => {
  it.each([
    ['12', 12], ['0,5', 0.5], ['0.5', 0.5], [' 3 ', 3],
  ])('parses %j', (input, expected) => expect(parseNumber(input)).toBe(expected));

  it.each(['', 'abc', '1e3', '1,2,3'])('rejects %j', (input) => expect(parseNumber(input)).toBeNaN());
});

describe('validateRecipeForm', () => {
  it('accepts a valid form', () => {
    expect(validateRecipeForm(validForm())).toEqual({});
  });

  it('flags required fields and invalid numbers', () => {
    const errors = validateRecipeForm({
      ...validForm(), title: ' ', instructions: '', categoryId: '', prepMinutes: '-1', baseServings: '1,5',
    });
    expect(Object.keys(errors).sort()).toEqual(['baseServings', 'categoryId', 'instructions', 'prepMinutes', 'title']);
  });

  it('flags missing ingredients, bad quantities and duplicates', () => {
    const form = validForm();
    expect(validateRecipeForm({ ...form, ingredients: [] })).toHaveProperty('ingredients');

    const errors = validateRecipeForm({
      ...form,
      ingredients: [
        { key: 'a', ingredientId: 'ing-1', quantity: '0', unit: 'g' },
        { key: 'b', ingredientId: 'ing-1', quantity: '5', unit: 'g' },
        { key: 'c', ingredientId: 'ing-1', quantity: '5', unit: 'kos' },
      ],
    });
    expect(errors).toEqual({
      'ingredients.0.quantity': 'Količina mora biti pozitivna.',
      'ingredients.1.ingredientId': 'Sestavina s to enoto je že navedena.',
    });
  });
});

describe('formToPayload', () => {
  it('trims text, converts numbers and drops UI-only keys', () => {
    expect(formToPayload({ ...validForm(), description: '  ' })).toEqual({
      title: 'Juha',
      description: null,
      instructions: 'Kuhaj.',
      categoryId: 'cat-1',
      prepMinutes: 0,
      baseServings: 4,
      ingredients: [{ ingredientId: 'ing-1', quantity: 0.5, unit: 'kg' }],
    });
  });
});
