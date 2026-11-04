import jwt from 'jsonwebtoken';
import { prisma } from '../../src/db.js';
import { hashPassword } from '../../src/utils/password.js';

let counter = 0;

export async function createUser({ role = 'USER', isActive = true, password = 'geslo1234', ...rest } = {}) {
  counter += 1;
  return prisma.user.create({
    data: {
      name: `Uporabnik ${counter}`,
      email: `user${counter}@test.si`,
      passwordHash: await hashPassword(password),
      role,
      isActive,
      ...rest,
    },
  });
}

export function tokenFor(user, { secret = process.env.JWT_SECRET, ...options } = {}) {
  return jwt.sign({ role: user.role }, secret, { subject: user.id, expiresIn: '1h', ...options });
}

export const bearer = (user) => ({ Authorization: `Bearer ${tokenFor(user)}` });
