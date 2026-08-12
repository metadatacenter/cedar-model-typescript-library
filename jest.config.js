module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test', '<rootDir>/itest'],
  testMatch: ['**/test/**/?(*.)+(spec|test).ts', '**/itest/**/?(*.)+(spec|test).ts', '**/?(*.)+(spec|test).ts'],
  globalSetup: './jest.setup.js',
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '!<rootDir>/src/**/*.spec.ts',
    // The public barrel contains only re-exports. CommonJS instrumentation
    // manufactures getter functions for those exports, so coverage measures
    // the actual implementations rather than transpiler-generated bindings.
    '!<rootDir>/src/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
