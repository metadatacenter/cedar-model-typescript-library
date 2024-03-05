module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: ['**/test/**/?(*.)+(spec|test).ts', '**/?(*.)+(spec|test).ts'],
  globalSetup: './jest.setup.js',
};
