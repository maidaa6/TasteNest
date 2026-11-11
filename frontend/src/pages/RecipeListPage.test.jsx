import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockApi, renderApp } from '../test/utils.jsx';

const RECIPES = [
  {
    id: 'r1', title: 'Korenčkova juha', description: 'Kremna juha.', prepMinutes: 35, baseServings: 4,
    category: { id: 'cat-soup', name: 'Juhe' }, author: { id: 'a1', name: 'Ana' },
  },
  {
    id: 'r2', title: 'Palačinke', description: null, prepMinutes: 30, baseServings: 2,
    category: { id: 'cat-sweet', name: 'Sladice' }, author: { id: 'a1', name: 'Ana' },
  },
];

function mockSearch(results = RECIPES) {
  return mockApi({
    'GET /categories': { body: { categories: [{ id: 'cat-soup', name: 'Juhe' }, { id: 'cat-sweet', name: 'Sladice' }] } },
    'GET /ingredients': { body: { ingredients: [{ id: 'ing-carrot', name: 'korenje' }] } },
    'GET /recipes': () => ({ body: { recipes: results } }),
  });
}

// Query string of the most recent recipe search request
const lastSearch = (fetchMock) => {
  const call = fetchMock.mock.calls.filter(([url]) => new URL(url).pathname === '/api/recipes').at(-1);
  return Object.fromEntries(new URL(call[0]).searchParams);
};

describe('RecipeListPage (US-04)', () => {
  afterEach(() => vi.unstubAllGlobals());

  // AC4 – no login required
  it('shows recipe cards to guests', async () => {
    mockSearch();
    renderApp('/');

    expect(await screen.findByRole('heading', { name: 'Korenčkova juha' })).toBeInTheDocument();
    expect(screen.getByText('35 min · 4 porcije')).toBeInTheDocument();
    expect(screen.getByText('30 min · 2 porciji')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Odpri recept Palačinke' })).toHaveAttribute('href', '/recepti/r2');
  });

  // AC1
  it('searches by title', async () => {
    const fetchMock = mockSearch();
    renderApp('/');
    const user = userEvent.setup();

    await user.type(screen.getByRole('searchbox', { name: 'Iskanje po nazivu' }), 'juha');
    await user.click(screen.getByRole('button', { name: 'Išči' }));

    await waitFor(() => expect(lastSearch(fetchMock)).toEqual({ q: 'juha' }));
  });

  // AC3
  it('combines search with category, ingredient and time filters', async () => {
    const fetchMock = mockSearch();
    renderApp('/?q=juha');
    const user = userEvent.setup();

    const categories = screen.getByRole('group', { name: 'Kategorija' });
    await user.click(await within(categories).findByRole('button', { name: 'Juhe' }));
    expect(within(categories).getByRole('button', { name: 'Juhe' })).toHaveAttribute('aria-pressed', 'true');
    await screen.findByRole('option', { name: 'korenje' });
    await user.selectOptions(screen.getByLabelText('Sestavina'), 'korenje');
    await user.selectOptions(screen.getByLabelText('Čas priprave'), 'do 45 min');

    await waitFor(() => expect(lastSearch(fetchMock)).toEqual({
      q: 'juha', categoryId: 'cat-soup', ingredientId: 'ing-carrot', maxPrepMinutes: '45',
    }));
    expect(screen.getByRole('searchbox')).toHaveValue('juha');
  });

  it('clears all filters', async () => {
    const fetchMock = mockSearch();
    renderApp('/?q=juha&categoryId=cat-soup');
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Počisti filtre' }));

    await waitFor(() => expect(lastSearch(fetchMock)).toEqual({}));
    expect(screen.getByRole('searchbox')).toHaveValue('');
    expect(screen.queryByRole('button', { name: 'Počisti filtre' })).not.toBeInTheDocument();
  });

  // AC5
  it('tells the user when nothing was found', async () => {
    mockSearch([]);
    renderApp('/?q=pica');

    expect(await screen.findByText('Ni najdenih receptov')).toBeInTheDocument();
  });

  it('reports API errors', async () => {
    mockApi({
      'GET /categories': { body: { categories: [] } },
      'GET /ingredients': { body: { ingredients: [] } },
      'GET /recipes': { status: 500, body: { error: { message: 'Napaka na strežniku.' } } },
    });
    renderApp('/');

    expect(await screen.findByRole('alert')).toHaveTextContent('Napaka na strežniku.');
  });
});
