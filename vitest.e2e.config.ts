import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['e2e/**/*.test.ts'],
    globals: true,
    testTimeout: 60_000,
    hookTimeout: 60_000,
    fileParallelism: false,
    reporters: ['default', 'junit'],
    outputFile: { junit: './e2e-reports/junit.xml' },
  },
});

