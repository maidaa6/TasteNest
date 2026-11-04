import { HttpError, notFound } from '../utils/httpError.js';

export function notFoundHandler(_req, _res, next) {
  next(notFound('Pot ne obstaja.'));
}

// Express recognises error handlers by their four-argument signature.
export function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: { message: err.message, details: err.details } });
  }

  // Malformed JSON body from express.json()
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { message: 'Telo zahteve ni veljaven JSON.' } });
  }

  console.error(err);
  res.status(500).json({ error: { message: 'Napaka na strežniku.' } });
}
