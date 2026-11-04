import { prisma } from '../db.js';
import { verifyToken } from '../utils/token.js';
import { forbidden, unauthorized } from '../utils/httpError.js';

/**
 * Requires a valid bearer token of an active account and sets `req.user`.
 * Role and activity are read from the database on every request so that role
 * changes and deactivation take effect before the token expires.
 */
export async function authenticate(req, _res, next) {
  const [scheme, token] = req.get('Authorization')?.split(' ') ?? [];
  const userId = scheme === 'Bearer' && token ? verifyToken(token) : null;
  if (!userId) return next(unauthorized());

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
  });
  if (!user?.isActive) return next(unauthorized());

  req.user = user;
  next();
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!roles.includes(req.user?.role)) return next(forbidden());
    next();
  };
}
