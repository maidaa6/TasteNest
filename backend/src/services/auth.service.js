import { Prisma } from '@prisma/client';
import { prisma } from '../db.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signToken } from '../utils/token.js';
import { conflict, unauthorized } from '../utils/httpError.js';
import { toPublicUser } from './user.service.js';

const EMAIL_TAKEN = 'Račun s tem e-naslovom že obstaja.';
const LOGIN_FAILED = 'Napačen e-naslov ali geslo.';

// Compared against when the email is unknown, so the response time does not reveal registered emails.
const DUMMY_HASH = await hashPassword('timing-equaliser');

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

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  const passwordOk = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);

  // Wrong password, unknown email and inactive account are deliberately indistinguishable.
  if (!user || !passwordOk || !user.isActive) throw unauthorized(LOGIN_FAILED);

  return { token: signToken(user), user: toPublicUser(user) };
}
