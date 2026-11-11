import { describe, expect, it } from 'vitest';
import { recipeVisual } from './recipeVisual.js';

const recipe = (title, category = 'Juhe') => ({ title, category: { name: category } });

describe('recipeVisual', () => {
  it('uses the bundled photo for a demo recipe, regardless of case and spacing', () => {
    const visual = recipeVisual(recipe('Korenčkova juha'));

    expect(visual.kind).toBe('photo');
    expect(visual.src).toMatch(/korenckova-juha/);
    expect(visual.alt).toBe('Fotografija jedi: Korenčkova juha');
    expect(recipeVisual(recipe('  KORENČKOVA juha ')).src).toBe(visual.src);
  });

  it('falls back to the category illustration for other recipes', () => {
    expect(recipeVisual(recipe('Bučna juha', 'Juhe'))).toEqual({ kind: 'illustration', icon: 'bowl', tone: 'carrot' });
    expect(recipeVisual(recipe('Tiramisu', 'Sladice'))).toEqual({ kind: 'illustration', icon: 'cake', tone: 'berry' });
  });

  it('has a default illustration for unknown categories', () => {
    expect(recipeVisual(recipe('Nekaj novega', 'Nova kategorija'))).toEqual({
      kind: 'illustration', icon: 'plate', tone: 'olive',
    });
  });
});
