import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderApp } from './test/utils.jsx';

describe('App routing', () => {
  it('renders the recipes page inside the layout', () => {
    renderApp('/');
    expect(screen.getByRole('link', { name: 'TasteNest' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Recepti' })).toBeInTheDocument();
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
