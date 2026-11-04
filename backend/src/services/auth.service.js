import { Prisma } from '@prisma/client';
import { prisma } from '../db.js';
import { hashPassword } from '../utils/password.js';
import { conflict } from '../utils/httpError.js';
import { toPublicUser } from './user.service.js';

const EMAIL_TAKEN = 'Račun s tem e-naslovom že obstaja.';

export async function registerUser({ name, email, password }) {
  if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) {
    throw conflict(EMAIL_TAKEN);
  }

  try {
    // Role is never taken from the request: public registration always yields USER.
    const user = await prisma.user.create({
      data: { name, email, passwordHash: await hashPassword(password), role: 'USER' },
    });
    return toPublicUser(user);
  } catch (err) {
    // Concurrent registration with the same email
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw conflict(EMAIL_TAKEN);
    }
    throw err;
  }
}
