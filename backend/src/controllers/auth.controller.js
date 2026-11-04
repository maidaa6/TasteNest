import { registerUser } from '../services/auth.service.js';

export async function register(req, res) {
  const user = await registerUser(req.valid.body);
  res.status(201).json({ user });
}
