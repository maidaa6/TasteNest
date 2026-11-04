import { afterEach, describe, expect, it, vi } from 'vitest';
import { api, ApiError } from './api.js';

function mockFetch(status, body) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => (body === undefined ? Promise.reject(new SyntaxError()) : Promise.resolve(body)),
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('api', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('sends JSON body and bearer token', async () => {
    const fetchMock = mockFetch(201, { id: 1 });

    const data = await api('/recipes', { method: 'POST', body: { title: 'Juha' }, token: 'abc' });

    expect(data).toEqual({ id: 1 });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/api\/recipes$/);
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({ 'Content-Type': 'application/json', Authorization: 'Bearer abc' });
    expect(JSON.parse(init.body)).toEqual({ title: 'Juha' });
  });

  it('omits body and auth headers when not provided', async () => {
    const fetchMock = mockFetch(200, []);
    await api('/recipes');
    expect(fetchMock.mock.calls[0][1].headers).toEqual({});
  });

  it('throws ApiError with the server message and details', async () => {
    mockFetch(400, { error: { message: 'Neveljavni podatki.', details: [{ field: 'body.email' }] } });

    const err = await api('/auth/register', { method: 'POST', body: {} }).catch((e) => e);

    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(400);
    expect(err.message).toBe('Neveljavni podatki.');
    expect(err.details).toEqual([{ field: 'body.email' }]);
  });

  it('falls back to a generic message when the body is not JSON', async () => {
    mockFetch(502);
    await expect(api('/recipes')).rejects.toMatchObject({ status: 502, message: 'Prišlo je do napake.' });
  });

  it('reports network failures as status 0', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(api('/recipes')).rejects.toMatchObject({ status: 0 });
  });

  it('returns null for 204 responses', async () => {
    mockFetch(204);
    await expect(api('/recipes/1/favorite', { method: 'DELETE' })).resolves.toBeNull();
  });
});
