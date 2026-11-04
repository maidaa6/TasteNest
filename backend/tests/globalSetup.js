import { execSync } from 'node:child_process';

export default function setup({ config }) {
  const url = config.env.DATABASE_URL;
  if (!/_test\b/.test(new URL(url).pathname)) {
    throw new Error(`Refusing to run tests against a non-test database: ${url}`);
  }

  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: url },
    stdio: 'pipe',
  });
}
