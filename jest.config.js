const { createRequire } = require('module');
const path = require('path');
const nextJest = require('next/jest');

// Walk the dependency chain because Yarn PnP only lets a package resolve its own dependencies
const resolveFrom = (from, request) => createRequire(from).resolve(request);
const vfileDir = path.dirname(
  resolveFrom(
    resolveFrom(require.resolve('react-markdown'), 'unified'),
    'vfile',
  ),
);

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
    '<rootDir>/scripts',
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
    // Jest 29.0 cannot resolve the package "imports" field that vfile uses for its browser shims
    '^#minpath$': path.join(vfileDir, 'lib/minpath.browser.js'),
    '^#minproc$': path.join(vfileDir, 'lib/minproc.browser.js'),
    '^#minurl$': path.join(vfileDir, 'lib/minurl.browser.js'),
    '^.+\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$/i': `<rootDir>/__tests__/util/fileMock.js`,
  },
  // if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
  moduleDirectories: ['node_modules', '<rootDir>/'],
  collectCoverageFrom: [
    '{src,pages}/**/*.{js,jsx,ts,tsx}',
    '__tests__/extensions/**/*.{js,jsx,ts,tsx}',
    'lighthouse/**/*.mjs',
    'scripts/**/*.ts',
    '!pages/api/**',
    '!**/*.generated.ts',
    '!**/*.mock.*',
    '!**/*.test.*',
    '!**/*Mock.ts',
  ],
  testEnvironment: 'jest-environment-jsdom',
  snapshotFormat: {
    escapeString: true,
    printBasicPrototype: true,
  },
};

// react-markdown and its remark, micromark, and unified dependency tree ship ESM only, so Jest must transform them
const esmPackages = [
  'react-markdown',
  'remark-.*',
  'rehype-.*',
  'micromark.*',
  'mdast-.*',
  'hast-.*',
  'unist-.*',
  'unified',
  'vfile.*',
  'bail',
  'trough',
  'zwitch',
  'ccount',
  'devlop',
  'dequal',
  'is-plain-obj',
  'is-alphabetical',
  'is-alphanumerical',
  'is-decimal',
  'is-hexadecimal',
  'escape-string-regexp',
  'decode-named-character-reference',
  'character-entities.*',
  'character-reference-invalid',
  'comma-separated-tokens',
  'space-separated-tokens',
  'property-information',
  'html-url-attributes',
  'estree-util-is-identifier-name',
  'longest-streak',
  'markdown-table',
  'parse-entities',
  'stringify-entities',
  'trim-lines',
  '@ungap/structured-clone',
  'style-to-js',
  'style-to-object',
  'inline-style-parser',
];

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = async () => {
  const config = await createJestConfig(customJestConfig)();
  return {
    ...config,
    // Extend the next/jest allow list instead of replacing it so its own packages still transform
    transformIgnorePatterns: config.transformIgnorePatterns.map((pattern) =>
      pattern.replace('(?!(', `(?!(${esmPackages.join('|')}|`),
    ),
  };
};
