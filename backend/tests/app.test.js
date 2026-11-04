import { describe, expect, it } from 'vitest';
import request from 'supertest';
import express from 'express';
import { z } from 'zod';
import { createApp } from '../src/app.js';
import { validate } from '../src/middleware/validate.js';
import { errorHandler } from '../src/middleware/errorHandler.js';

describe('API skeleton', () => {
  const app = createApp();

  it('reports health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('returns 404 in the common error format for unknown routes', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.error.message).toBeTypeOf('string');
  });

  it('rejects malformed JSON with 400', async () => {
    const res = await request(app)
      .post('/api/health')
      .set('Content-Type', 'application/json')
      .send('{"broken":');
    expect(res.status).toBe(400);
  });
});

describe('validate middleware', () => {
  const app = express();
  app.use(express.json());
  app.post(
    '/items',
    validate({ body: z.object({ name: z.string().trim().min(1) }), query: z.object({ page: z.coerce.number().int().positive().default(1) }) }),
    (req, res) => res.json(req.valid),
  );
  app.use(errorHandler);

  it('exposes parsed values on req.valid', async () => {
    const res = await request(app).post('/items?page=2').send({ name: '  pasta ' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ body: { name: 'pasta' }, query: { page: 2 } });
  });

  it('collects issues from every request part', async () => {
    const res = await request(app).post('/items?page=0').send({ name: '' });
    expect(res.status).toBe(400);
    expect(res.body.error.details.map((d) => d.field).sort()).toEqual(['body.name', 'query.page']);
  });
});
