import * as authService from '../services/auth.service.js';
import { toPublicUser } from '../services/user.service.js';

export async function register(req, res) {
  const user = await authService.registerUser(req.valid.body);
  res.status(201).json({ user });
}

export async function login(req, res) {
  res.json(await authService.login(req.valid.body));
}

export function me(req, res) {
  res.json({ user: toPublicUser(req.user) });
}
