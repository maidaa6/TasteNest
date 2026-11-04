import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import * as auth from '../controllers/auth.controller.js';

const email = z.string('E-naslov je obvezen.')
  .trim()
  .toLowerCase()
  .pipe(z.email('Vnesite veljaven e-naslov.'));

const registerSchema = z.object({
  name: z.string('Ime je obvezno.').trim().min(1, 'Ime je obvezno.').max(100, 'Ime je predolgo.'),
  email,
  // bcrypt only uses the first 72 bytes
  password: z.string('Geslo je obvezno.')
    .min(8, 'Geslo mora imeti vsaj 8 znakov.')
    .max(72, 'Geslo je predolgo.'),
});

const loginSchema = z.object({
  email,
  password: z.string('Geslo je obvezno.').min(1, 'Geslo je obvezno.'),
});

export const authRouter = Router();

authRouter.post('/register', validate({ body: registerSchema }), auth.register);
authRouter.post('/login', validate({ body: loginSchema }), auth.login);
authRouter.get('/me', authenticate, auth.me);
