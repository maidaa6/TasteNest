import jwt from 'jsonwebtoken';
import { config } from '../config.js';

const ALGORITHM = 'HS256';

export function signToken(user) {
  return jwt.sign({ role: user.role }, config.jwtSecret, {
    subject: user.id,
    expiresIn: config.jwtExpiresIn,
    algorithm: ALGORITHM,
  });
}

/** Returns the user id from a valid token, or null for any invalid/expired token. */
export function verifyToken(token) {
  try {
    const { sub } = jwt.verify(token, config.jwtSecret, { algorithms: [ALGORITHM] });
    return typeof sub === 'string' ? sub : null;
  } catch {
    return null;
  }
}
