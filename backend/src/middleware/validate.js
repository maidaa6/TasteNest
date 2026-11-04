import { badRequest } from '../utils/httpError.js';

/**
 * Validates request parts against zod schemas. Parsed values are exposed on
 * `req.valid` because Express 5 makes `req.query` read-only.
 */
export function validate(schemas) {
  return (req, _res, next) => {
    req.valid = {};
    const issues = [];

    for (const part of ['params', 'query', 'body']) {
      if (!schemas[part]) continue;
      const result = schemas[part].safeParse(req[part] ?? {});
      if (result.success) {
        req.valid[part] = result.data;
      } else {
        issues.push(...result.error.issues.map((issue) => ({
          field: [part, ...issue.path].join('.'),
          message: issue.message,
        })));
      }
    }

    if (issues.length) return next(badRequest('Neveljavni podatki.', issues));
    next();
  };
}
