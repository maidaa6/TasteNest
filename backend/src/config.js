export const config = {
  port: Number(process.env.PORT ?? 3000),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
};

export function assertConfig() {
  if (!config.jwtSecret) {
    throw new Error('JWT_SECRET is not set. Copy backend/.env.example to backend/.env.');
  }
}
