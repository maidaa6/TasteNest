import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterPage from './RegisterPage.jsx';
import { register } from '../services/auth.js';
import { ApiError } from '../services/api.js';

vi.mock('../services/auth.js', async (importOriginal) => ({
  ...(await importOriginal()),
  register: vi.fn(),
}));

async function fillAndSubmit({ name = 'Maja', email = 'maja@example.com', password = 'skrivnost123' } = {}) {
  const user = userEvent.setup();
  if (name) await user.type(screen.getByLabelText('Ime'), name);
  if (email) await user.type(screen.getByLabelText('E-naslov'), email);
  if (password) await user.type(screen.getByLabelText('Geslo'), password);
  await user.click(screen.getByRole('button', { name: 'Ustvari račun' }));
}

describe('RegisterPage (US-01)', () => {
  beforeEach(() => {
    vi.mocked(register).mockReset();
    render(<RegisterPage />);
  });

  it('validates input before calling the API', async () => {
    await fillAndSubmit({ name: '', email: 'maja@', password: '1234567' });

    expect(screen.getByText('Ime je obvezno.')).toBeInTheDocument();
    expect(screen.getByText('Vnesite veljaven e-naslov.')).toBeInTheDocument();
    expect(screen.getByText('Geslo mora imeti vsaj 8 znakov.')).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
  });

  it('confirms a successful registration', async () => {
    register.mockResolvedValue({ user: { id: '1', role: 'USER' } });

    await fillAndSubmit();

    expect(register).toHaveBeenCalledWith({ name: 'Maja', email: 'maja@example.com', password: 'skrivnost123' });
    expect(await screen.findByRole('status')).toHaveTextContent('Račun je ustvarjen');
  });

  it('shows a taken email next to the email field', async () => {
    register.mockRejectedValue(new ApiError(409, 'Račun s tem e-naslovom že obstaja.'));

    await fillAndSubmit();

    expect(await screen.findByText('Račun s tem e-naslovom že obstaja.')).toBeInTheDocument();
    expect(screen.getByLabelText('E-naslov')).toHaveAttribute('aria-invalid', 'true');
  });

  it('maps server validation details to fields', async () => {
    register.mockRejectedValue(new ApiError(400, 'Neveljavni podatki.', [
      { field: 'body.password', message: 'Geslo je predolgo.' },
    ]));

    await fillAndSubmit();

    expect(await screen.findByText('Geslo je predolgo.')).toBeInTheDocument();
  });

  it('shows a general error when the server is unreachable', async () => {
    register.mockRejectedValue(new ApiError(0, 'Strežnik ni dosegljiv. Poskusite znova.'));

    await fillAndSubmit();

    expect(await screen.findByRole('alert')).toHaveTextContent('Strežnik ni dosegljiv');
  });
});
