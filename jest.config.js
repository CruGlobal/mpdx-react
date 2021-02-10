module.exports = {
    roots: ['<rootDir>/src', '<rootDir>/__tests__/pages'],
    setupFilesAfterEnv: ['<rootDir>/__tests__/util/setup.ts'],
    transform: {
        '\\.[jt]sx?$': 'babel-jest',
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
            '<rootDir>/__tests__/util/fileMock.js',
        '\\.(gql|graphql)$': 'jest-transform-graphql',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
