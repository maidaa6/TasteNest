import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import express from 'express';
import { authenticate, requireRole } from '../../src/middleware/auth.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';
import { prisma, resetDatabase } from '../helpers/db.js';
import { bearer, createUser } from '../helpers/auth.js';

// Recipe and admin endpoints arrive in later stories; the guards are verified in isolation here.
const app = express();
app.post('/author-only', authenticate, requireRole('AUTHOR', 'ADMIN'), (req, res) => res.json({ id: req.user.id }));
app.post('/admin-only', authenticate, requireRole('ADMIN'), (_req, res) => res.sendStatus(204));
app.use(errorHandler);

describe('requireRole (US-02 AC4)', () => {
  beforeEach(resetDatabase);
  afterAll(() => prisma.$disconnect());

  it('forbids USER from author and admin actions', async () => {
    const user = await createUser({ role: 'USER' });

    expect((await request(app).post('/author-only').set(bearer(user))).status).toBe(403);
    expect((await request(app).post('/admin-only').set(bearer(user))).status).toBe(403);
  });

  it('allows AUTHOR to author but not to administer', async () => {
    const author = await createUser({ role: 'AUTHOR' });

    expect((await request(app).post('/author-only').set(bearer(author))).status).toBe(200);
    expect((await request(app).post('/admin-only').set(bearer(author))).status).toBe(403);
  });

  it('uses the current role from the database, not the one in the token', async () => {
    const author = await createUser({ role: 'AUTHOR' });
    const headers = bearer(author);
    await prisma.user.update({ where: { id: author.id }, data: { role: 'USER' } });

    expect((await request(app).post('/author-only').set(headers)).status).toBe(403);
  });
});
