import { describe, expect, it } from 'vitest';
import { formatQuantity, formatServings, splitSteps } from './format.js';

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

describe('splitSteps', () => {
  it('uses line breaks as step boundaries', () => {
    expect(splitSteps('Prepraži čebulo.\n\n Dodaj korenje in kuhaj.\n')).toEqual([
      'Prepraži čebulo.', 'Dodaj korenje in kuhaj.',
    ]);
  });

  it('splits a single paragraph into sentences', () => {
    expect(splitSteps('Skuhaj testenine. Na olju prepraži čebulo, dodaj 400 g paradižnika. Začini!')).toEqual([
      'Skuhaj testenine.', 'Na olju prepraži čebulo, dodaj 400 g paradižnika.', 'Začini!',
    ]);
  });

  it('does not split decimals or abbreviations followed by lowercase text', () => {
    expect(splitSteps('Dodaj 0.5 l mleka in pribl. 2 jajci.')).toEqual(['Dodaj 0.5 l mleka in pribl. 2 jajci.']);
  });
});
