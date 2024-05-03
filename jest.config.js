const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const customJestConfig = {
  // Add more setup options before each test is run
  roots: [
    '<rootDir>/src',
    '<rootDir>/pages',
    '<rootDir>/__tests__',
    '<rootDir>/lighthouse',
  ],
  testRegex: '.+\\.test\\.m?[jt]sx?$',
  globalSetup: '<rootDir>/__tests__/util/globalSetup.ts',
  setupFilesAfterEnv: ['<rootDir>/__tests__/util/setup.ts'],
  transform: {
    '\\.(gql|graphql)$': '@graphql-tools/jest-transform',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node', 'mjs'],
  clearMocks: true,
  // allows to import modules url starting from the baseUrl
  moduleNameMapper: {
    '^@/src/(.*)$': '<rootDir>/src/$1',
    '^@/pages/(.*)$': '<rootDir>/pages/$1',
    '^@/__tests__/(.*)$': '<rootDir>/__tests__/$1',
    '^@/lighthouse/(.*)$': '<rootDir>/lighthouse/$1',
    '^.+\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$/i': `<rootDir>/__tests__/util/fileMock.js`,
  },
  // if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
  moduleDirectories: ['node_modules', '<rootDir>/'],
  collectCoverageFrom: [
    '{src,pages}/**/*.{js,jsx,ts,tsx}',
    '__tests__/util/extensions/**/*.{js,jsx,ts,tsx}',
    'lighthouse/**/*.mjs',
    '!pages/api/**',
    '!**/*.generated.ts',
    '!**/*.mock.*',
    '!**/*.stories.*',
    '!**/*.test.*',
  ],
  testEnvironment: 'jest-environment-jsdom',
  snapshotFormat: {
    escapeString: true,
    printBasicPrototype: true,
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
