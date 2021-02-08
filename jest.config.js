module.exports = {
    roots: ['<rootDir>/src', '<rootDir>/__tests__/pages'],
    preset: 'ts-jest',
    setupFilesAfterEnv: ['<rootDir>/__tests__/util/setup.ts'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
            '<rootDir>/__tests__/util/fileMock.js',
        '\\.(gql|graphql)$': 'jest-transform-graphql',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/.yarn/'],
    globals: {
        'ts-jest': {
            tsConfig: '<rootDir>/tsconfig.jest.json',
        },
    },
    testEnvironment: 'jest-environment-jsdom-sixteen',
    testTimeout: 10000,
};
