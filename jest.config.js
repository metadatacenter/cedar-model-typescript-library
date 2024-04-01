module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test', '<rootDir>/itest'],
  testMatch: ['**/test/**/?(*.)+(spec|test).ts', '**/itest/**/?(*.)+(spec|test).ts', '**/?(*.)+(spec|test).ts'],
  globalSetup: './jest.setup.js',
};
