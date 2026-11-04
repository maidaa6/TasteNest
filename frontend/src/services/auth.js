import { api } from './api.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mirrors the server rules so obvious mistakes are caught before a request is made.
export function validateRegistration({ name, email, password }) {
  const errors = {};
  if (!name.trim()) errors.name = 'Ime je obvezno.';
  if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Vnesite veljaven e-naslov.';
  if (password.length < 8) errors.password = 'Geslo mora imeti vsaj 8 znakov.';
  return errors;
}

export function register({ name, email, password }) {
  return api('/auth/register', { method: 'POST', body: { name, email, password } });
}

export function login({ email, password }) {
  return api('/auth/login', { method: 'POST', body: { email, password } });
}
