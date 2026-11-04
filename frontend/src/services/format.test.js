import { describe, expect, it } from 'vitest';
import { formatQuantity, formatServings } from './format.js';

describe('formatQuantity', () => {
  it('uses a decimal comma and at most two decimals', () => {
    expect(formatQuantity(0.6)).toBe('0,6');
    expect(formatQuantity(200)).toBe('200');
    expect(formatQuantity(1 / 3)).toBe('0,33');
  });
});

describe('formatServings', () => {
  it.each([
    [1, '1 porcija'], [2, '2 porciji'], [3, '3 porcije'], [4, '4 porcije'],
    [5, '5 porcij'], [11, '11 porcij'], [101, '101 porcija'], [102, '102 porciji'],
  ])('%i → %s', (n, expected) => expect(formatServings(n)).toBe(expected));
});
