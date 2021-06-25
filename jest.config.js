module.exports = {
  roots: ['<rootDir>/src', '<rootDir>/pages', '<rootDir>/__tests__/pages'],
  globalSetup: '<rootDir>/__tests__/util/globalSetup.ts',
  setupFilesAfterEnv: ['<rootDir>/__tests__/util/setup.ts'],
  transform: {
    '\\.[jt]sx?$': 'babel-jest',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__tests__/util/fileMock.js',
    '\\.(gql|graphql)$': 'jest-transform-graphql',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  clearMocks: true,
  // allows to import modules url starting from the baseUrl
  moduleNameMapper: {
    'src/(.*)': '<rootDir>/src/$1',
    'pages/(.*)': '<rootDir>/pages/$1',
    '__tests__/(.*)': '<rootDir>/__tests__/$1',
  },
};
