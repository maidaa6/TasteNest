import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { createApp } from '../../src/app.js';
import { prisma, resetDatabase } from '../helpers/db.js';

const app = createApp();
const valid = { name: 'Maja Novak', email: 'maja@example.com', password: 'skrivnost123' };
const register = (body) => request(app).post('/api/auth/register').send(body);

describe('POST /api/auth/register (US-01)', () => {
  beforeEach(resetDatabase);
  afterAll(() => prisma.$disconnect());

  it('creates an account and returns the public profile', async () => {
    const res = await register(valid);

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ name: 'Maja Novak', email: 'maja@example.com', role: 'USER' });
    expect(res.body.user.id).toBeTypeOf('string');
  });

  // AC1
  it.each([
    ['empty name', { ...valid, name: '   ' }, 'body.name'],
    ['invalid email', { ...valid, email: 'maja@' }, 'body.email'],
    ['short password', { ...valid, password: '1234567' }, 'body.password'],
    ['missing fields', {}, 'body.name'],
  ])('rejects %s without creating an account', async (_case, body, field) => {
    const res = await register(body);

    expect(res.status).toBe(400);
    expect(res.body.error.details.map((d) => d.field)).toContain(field);
    expect(await prisma.user.count()).toBe(0);
  });

  it('accepts a password of exactly 8 characters', async () => {
    const res = await register({ ...valid, password: '12345678' });
    expect(res.status).toBe(201);
  });

  // AC2
  it('rejects an email that is already registered, regardless of case', async () => {
    await register(valid);
    const res = await register({ ...valid, name: 'Druga Maja', email: 'MAJA@example.com' });

    expect(res.status).toBe(409);
    expect(await prisma.user.count()).toBe(1);
  });

  // AC3
  it.each(['AUTHOR', 'ADMIN'])('always assigns USER even when the client sends %s', async (role) => {
    const res = await register({ ...valid, role });

    expect(res.body.user.role).toBe('USER');
    const stored = await prisma.user.findUnique({ where: { email: valid.email } });
    expect(stored.role).toBe('USER');
  });

  // AC4
  it('stores only a bcrypt hash and never returns password data', async () => {
    const res = await register(valid);

    const stored = await prisma.user.findUnique({ where: { email: valid.email } });
    expect(stored.passwordHash).not.toBe(valid.password);
    expect(await bcrypt.compare(valid.password, stored.passwordHash)).toBe(true);

    const raw = JSON.stringify(res.body);
    expect(raw).not.toContain(valid.password);
    expect(raw).not.toContain(stored.passwordHash);
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });
});
