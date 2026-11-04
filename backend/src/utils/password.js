import bcrypt from 'bcryptjs';

// Lowered only in tests; production cost stays at bcrypt's recommended range.
const rounds = Number(process.env.BCRYPT_ROUNDS ?? 12);

export const hashPassword = (plain) => bcrypt.hash(plain, rounds);
export const verifyPassword = (plain, hash) => bcrypt.compare(plain, hash);
