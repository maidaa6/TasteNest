import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { AUTHOR, mockApi, renderApp } from '../test/utils.jsx';

const RECIPE = {
  id: 'r1',
  title: 'Korenčkova juha',
  description: 'Kremna juha brez smetane.',
  instructions: 'Prepraži čebulo.\nDodaj korenje in kuhaj.',
  prepMinutes: 35,
  baseServings: 4,
  status: 'PUBLISHED',
  author: { id: AUTHOR.id, name: AUTHOR.name },
  category: { id: 'cat-soup', name: 'Juhe' },
  ingredients: [
    { ingredientId: 'i1', name: 'korenje', quantity: 0.6, unit: 'kg' },
    { ingredientId: 'i2', name: 'čebula', quantity: 1, unit: 'kos' },
  ],
};

describe('RecipeDetailPage (US-04)', () => {
  afterEach(() => vi.unstubAllGlobals());

  // AC4 – public details without login
  it('shows the full recipe to guests', async () => {
    mockApi({ 'GET /recipes/r1': { body: { recipe: RECIPE } } });
    renderApp('/recepti/r1');

    expect(await screen.findByRole('heading', { name: 'Korenčkova juha' })).toBeInTheDocument();
    expect(screen.getByText(`Avtor: ${AUTHOR.name} · 35 min · 4 porcije`)).toBeInTheDocument();
    expect(screen.getByText('0,6 kg korenje')).toBeInTheDocument();
    expect(screen.getByText('1 kos čebula')).toBeInTheDocument();
    expect(screen.getByText(/Dodaj korenje in kuhaj/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Uredi recept' })).not.toBeInTheDocument();
  });

  it('offers editing to the recipe author', async () => {
    mockApi({ 'GET /recipes/r1': { body: { recipe: RECIPE } } });
    renderApp('/recepti/r1', { user: AUTHOR });

    expect(await screen.findByRole('link', { name: 'Uredi recept' })).toHaveAttribute('href', '/recepti/r1/uredi');
  });

  it('explains when a recipe is missing or withdrawn', async () => {
    mockApi({ 'GET /recipes/r9': { status: 404, body: { error: { message: 'Recept ne obstaja.' } } } });
    renderApp('/recepti/r9');

    expect(await screen.findByRole('heading', { name: 'Recept ne obstaja' })).toBeInTheDocument();
  });
});
