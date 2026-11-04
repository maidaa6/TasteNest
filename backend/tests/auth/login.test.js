import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/app.js';
import { prisma, resetDatabase } from '../helpers/db.js';
import { createUser, tokenFor } from '../helpers/auth.js';

const app = createApp();
const login = (body) => request(app).post('/api/auth/login').send(body);
const LOGIN_FAILED = 'Napačen e-naslov ali geslo.';

describe('POST /api/auth/login (US-02)', () => {
  beforeEach(resetDatabase);
  afterAll(() => prisma.$disconnect());

  // AC1
  it('returns a time-limited JWT for an active account', async () => {
    const user = await createUser({ password: 'pravilno123' });

    const res = await login({ email: user.email.toUpperCase(), password: 'pravilno123' });

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ id: user.id, role: 'USER' });
    expect(res.body.user).not.toHaveProperty('passwordHash');

    const payload = jwt.verify(res.body.token, process.env.JWT_SECRET);
    expect(payload.sub).toBe(user.id);
    expect(payload.exp).toBeGreaterThan(payload.iat);
  });

  it('issues a token that grants access to protected endpoints', async () => {
    const user = await createUser({ password: 'pravilno123' });
    const { body } = await login({ email: user.email, password: 'pravilno123' });

    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${body.token}`);

    expect(me.status).toBe(200);
    expect(me.body.user.id).toBe(user.id);
  });

  // AC2
  it.each([
    ['wrong password', async () => ({ email: (await createUser()).email, password: 'napacno123' })],
    ['unknown email', async () => ({ email: 'nobody@test.si', password: 'geslo1234' })],
    ['inactive account', async () => ({ email: (await createUser({ isActive: false })).email, password: 'geslo1234' })],
  ])('returns the same failure for %s without a token', async (_case, credentials) => {
    const res = await login(await credentials());

    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe(LOGIN_FAILED);
    expect(res.body).not.toHaveProperty('token');
  });

  it('validates the request body', async () => {
    const res = await login({ email: 'not-an-email' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/auth/me – token checks (US-02 AC3)', () => {
  let user;
  beforeEach(async () => {
    await resetDatabase();
    user = await createUser();
  });

  const me = (header) => {
    const req = request(app).get('/api/auth/me');
    return header ? req.set('Authorization', header) : req;
  };

  it('rejects a missing token', async () => {
    expect((await me()).status).toBe(401);
  });

  it('rejects an expired token', async () => {
    const expired = tokenFor(user, { expiresIn: -10 });
    expect((await me(`Bearer ${expired}`)).status).toBe(401);
  });

  it('rejects a token signed with another secret', async () => {
    const forged = tokenFor(user, { secret: 'attacker-secret' });
    expect((await me(`Bearer ${forged}`)).status).toBe(401);
  });

  it('rejects a tampered payload', async () => {
    const [header, , signature] = tokenFor(user).split('.');
    const payload = Buffer.from(JSON.stringify({ sub: user.id, role: 'ADMIN' })).toString('base64url');
    expect((await me(`Bearer ${header}.${payload}.${signature}`)).status).toBe(401);
  });

  it('rejects a malformed Authorization header', async () => {
    expect((await me(`Token ${tokenFor(user)}`)).status).toBe(401);
  });

  it('rejects a valid token of a deactivated account', async () => {
    const token = tokenFor(user);
    await prisma.user.update({ where: { id: user.id }, data: { isActive: false } });
    expect((await me(`Bearer ${token}`)).status).toBe(401);
  });
});
