import { existsSync } from 'node:fs';
import { defineConfig } from 'vitest/config';

if (existsSync('.env')) process.loadEnvFile('.env');

const testDatabaseUrl = process.env.TEST_DATABASE_URL
  ?? 'postgresql://tastenest:tastenest@localhost:5432/tastenest_test?schema=public';

export default defineConfig({
  test: {
    env: {
      DATABASE_URL: testDatabaseUrl,
      JWT_SECRET: process.env.JWT_SECRET ?? 'test-secret',
      BCRYPT_ROUNDS: '4',
    },
    globalSetup: './tests/globalSetup.js',
    // Integration tests share one database, so files must not run concurrently.
    fileParallelism: false,
  },
});
