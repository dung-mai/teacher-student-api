module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Where your tests reside:
  testMatch: ['**/tests/**/*.test.ts'],

  // Coverage settings
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  // Coverage threshold
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
};
