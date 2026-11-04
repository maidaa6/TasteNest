import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AUTHOR, mockApi, renderApp } from '../test/utils.jsx';

const CATALOG = {
  'GET /categories': { body: { categories: [{ id: 'cat-soup', name: 'Juhe' }, { id: 'cat-sweet', name: 'Sladice' }] } },
  'GET /ingredients': { body: { ingredients: [{ id: 'ing-carrot', name: 'korenje' }, { id: 'ing-milk', name: 'mleko' }] } },
  'GET /recipes/mine': { body: { recipes: [] } },
};

const EXISTING = {
  id: 'r1',
  title: 'Korenčkova juha',
  description: null,
  instructions: 'Skuhaj.',
  prepMinutes: 30,
  baseServings: 4,
  status: 'PUBLISHED',
  category: { id: 'cat-soup', name: 'Juhe' },
  ingredients: [{ ingredientId: 'ing-carrot', name: 'korenje', quantity: 0.6, unit: 'kg' }],
};

async function fillNewRecipe(user) {
  await user.type(await screen.findByLabelText('Naslov'), 'Korenčkova juha');
  await user.selectOptions(screen.getByLabelText('Kategorija'), 'Juhe');
  await user.type(screen.getByLabelText('Čas priprave (min)'), '30');
  await user.type(screen.getByLabelText('Število porcij'), '4');
  await user.selectOptions(screen.getByLabelText('Sestavina 1'), 'korenje');
  await user.type(screen.getByLabelText('Količina 1'), '0,6');
  await user.selectOptions(screen.getByLabelText('Enota 1'), 'kg');
  await user.type(screen.getByLabelText('Postopek'), 'Skuhaj in zmiksaj.');
}

describe('RecipeFormPage (US-03)', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('is not available to USER accounts', () => {
    mockApi(CATALOG);
    renderApp('/recepti/nov', { user: { ...AUTHOR, role: 'USER' } });
    expect(screen.getByRole('heading', { name: 'Dostop ni dovoljen' })).toBeInTheDocument();
  });

  // AC1, AC2 – client-side checks
  it('validates the form before sending', async () => {
    const fetchMock = mockApi(CATALOG);
    renderApp('/recepti/nov', { user: AUTHOR });
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Objavi recept' }));

    expect(screen.getByText('Naslov je obvezen.')).toBeInTheDocument();
    expect(screen.getByText('Izberite kategorijo.')).toBeInTheDocument();
    expect(screen.getByText('Izberite sestavino.')).toBeInTheDocument();
    expect(screen.getByText('Količina mora biti pozitivna.')).toBeInTheDocument();
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'POST')).toBe(false);
  });

  it('publishes a recipe and returns to the author list', async () => {
    const fetchMock = mockApi({
      ...CATALOG,
      'POST /recipes': ({ body }) => ({ status: 201, body: { recipe: { ...EXISTING, ...body, id: 'new' } } }),
    });
    renderApp('/recepti/nov', { user: AUTHOR });
    const user = userEvent.setup();

    await fillNewRecipe(user);
    await user.click(screen.getByRole('button', { name: 'Objavi recept' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Recept »Korenčkova juha« je objavljen.');
    const [, init] = fetchMock.mock.calls.find(([, i]) => i?.method === 'POST');
    expect(init.headers.Authorization).toBe('Bearer test-token');
    expect(JSON.parse(init.body)).toEqual({
      title: 'Korenčkova juha',
      description: null,
      instructions: 'Skuhaj in zmiksaj.',
      categoryId: 'cat-soup',
      prepMinutes: 30,
      baseServings: 4,
      ingredients: [{ ingredientId: 'ing-carrot', quantity: 0.6, unit: 'kg' }],
    });
  });

  it('adds and removes ingredient lines', async () => {
    mockApi(CATALOG);
    renderApp('/recepti/nov', { user: AUTHOR });
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Dodaj sestavino' }));
    expect(screen.getByLabelText('Sestavina 2')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Odstrani sestavino 1' }));
    expect(screen.queryByLabelText('Sestavina 2')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Sestavina 1')).toBeInTheDocument();
  });

  it('shows server-side field errors next to the ingredient', async () => {
    mockApi({
      ...CATALOG,
      'POST /recipes': {
        status: 400,
        body: { error: { message: 'Neveljavni podatki.', details: [{ field: 'body.ingredients.0.ingredientId', message: 'Sestavina ne obstaja.' }] } },
      },
    });
    renderApp('/recepti/nov', { user: AUTHOR });
    const user = userEvent.setup();

    await fillNewRecipe(user);
    await user.click(screen.getByRole('button', { name: 'Objavi recept' }));

    expect(await screen.findByText('Sestavina ne obstaja.')).toBeInTheDocument();
  });

  // AC4
  it('loads an existing recipe and saves changes with PATCH', async () => {
    const fetchMock = mockApi({
      ...CATALOG,
      'GET /recipes/r1': { body: { recipe: EXISTING } },
      'PATCH /recipes/r1': ({ body }) => ({ body: { recipe: { ...EXISTING, ...body } } }),
    });
    renderApp('/recepti/r1/uredi', { user: AUTHOR });
    const user = userEvent.setup();

    const title = await screen.findByLabelText('Naslov');
    expect(title).toHaveValue('Korenčkova juha');
    expect(screen.getByLabelText('Količina 1')).toHaveValue('0,6');

    await user.clear(title);
    await user.type(title, 'Juha iz korenja');
    await user.click(screen.getByRole('button', { name: 'Shrani spremembe' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Recept »Juha iz korenja« je posodobljen.');
    const [, init] = fetchMock.mock.calls.find(([, i]) => i?.method === 'PATCH');
    expect(JSON.parse(init.body).title).toBe('Juha iz korenja');
  });

  it("explains when the recipe cannot be edited (e.g. someone else's)", async () => {
    mockApi({
      ...CATALOG,
      'GET /recipes/r2': { status: 404, body: { error: { message: 'Recept ne obstaja.' } } },
    });
    renderApp('/recepti/r2/uredi', { user: AUTHOR });

    expect(await screen.findByRole('alert')).toHaveTextContent('Recept ne obstaja.');
  });
});

describe('MyRecipesPage', () => {
  afterEach(() => vi.unstubAllGlobals());

  it("lists the author's recipes with status and edit links", async () => {
    mockApi({
      'GET /recipes/mine': {
        body: { recipes: [EXISTING, { ...EXISTING, id: 'r2', title: 'Umaknjena juha', status: 'HIDDEN' }] },
      },
    });
    renderApp('/moji-recepti', { user: AUTHOR });

    const items = await screen.findAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(within(items[1]).getByText('Umaknjen')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Uredi Korenčkova juha' })).toHaveAttribute('href', '/recepti/r1/uredi');
  });

  it('shows the author navigation entry', async () => {
    mockApi({ 'GET /recipes/mine': { body: { recipes: [] } } });
    renderApp('/moji-recepti', { user: AUTHOR });

    expect(screen.getByRole('link', { name: 'Moji recepti' })).toHaveClass('active');
    expect(await screen.findByText('Objavili še niste nobenega recepta.')).toBeInTheDocument();
  });
});
