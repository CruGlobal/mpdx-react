const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const customJestConfig = {
  // Add more setup options before each test is run
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  roots: ['<rootDir>/src', '<rootDir>/pages', '<rootDir>/__tests__/pages'],
  globalSetup: '<rootDir>/__tests__/util/globalSetup.ts',
  setupFilesAfterEnv: ['<rootDir>/__tests__/util/setup.ts'],
  // TODO: Potentially remove this as not needed by the Rust Compiler.
  // transform: {
  //   // From https://github.com/vercel/next.js/issues/30811#issuecomment-963102661
  //   '\\.[jt]sx?$': ['babel-jest', { presets: ['next/babel'] }],
  //   '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
  //     '<rootDir>/__tests__/util/fileMock.js',
  //   '\\.(gql|graphql)$': 'jest-transform-graphql',
  // },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  clearMocks: true,
  // allows to import modules url starting from the baseUrl
  moduleNameMapper: {
    '^@/src/(.*)$': '<rootDir>/src/$1',
    '^@/pages/(.*)$': '<rootDir>/pages/$1',
    '^@/__tests__/(.*)$': '<rootDir>/__tests__/$1',
  },
  // if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testEnvironment: 'jest-environment-jsdom',
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
