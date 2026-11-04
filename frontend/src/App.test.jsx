import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { EMPTY_CATALOG, mockApi, renderApp } from './test/utils.jsx';

describe('App routing', () => {
  beforeEach(() => {
    mockApi(EMPTY_CATALOG);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('renders the recipe list as the home page', async () => {
    renderApp('/');
    expect(screen.getByRole('link', { name: 'TasteNest' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Raziskuj recepte' })).toBeInTheDocument();
    expect(await screen.findByText('Ni najdenih receptov')).toBeInTheDocument();
  });

  it('renders a not-found page for unknown paths', () => {
    renderApp('/ne-obstaja');
    expect(screen.getByRole('heading', { name: 'Stran ne obstaja' })).toBeInTheDocument();
  });

  it('offers login and registration to guests', () => {
    renderApp('/registracija');
    expect(screen.getByRole('heading', { name: 'Registracija' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Registracija' })).toHaveClass('active');
    expect(screen.getByRole('link', { name: 'Prijava' })).toBeInTheDocument();
  });
});
