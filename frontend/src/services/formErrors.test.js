import { describe, expect, it } from 'vitest';
import { fieldErrorsFromApi } from './formErrors.js';

describe('fieldErrorsFromApi', () => {
  it('strips the request part and keeps the first message per field', () => {
    expect(fieldErrorsFromApi([
      { field: 'body.email', message: 'prvo' },
      { field: 'body.email', message: 'drugo' },
      { field: 'body.ingredients.0.quantity', message: 'količina' },
    ])).toEqual({ email: 'prvo', 'ingredients.0.quantity': 'količina' });
  });

  it('handles missing details', () => {
    expect(fieldErrorsFromApi(undefined)).toEqual({});
  });
});
