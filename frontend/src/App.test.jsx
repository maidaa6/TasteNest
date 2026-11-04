import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import App from './App.jsx';

const renderAt = (path) => render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>);

describe('App routing', () => {
  it('renders the recipes page inside the layout', () => {
    renderAt('/');
    expect(screen.getByRole('link', { name: 'TasteNest' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Recepti' })).toBeInTheDocument();
  });

  it('renders a not-found page for unknown paths', () => {
    renderAt('/ne-obstaja');
    expect(screen.getByRole('heading', { name: 'Stran ne obstaja' })).toBeInTheDocument();
  });
});
