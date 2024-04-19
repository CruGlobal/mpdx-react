module.exports = {
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  extends: [
    'plugin:jest/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:react/recommended', // Uses the recommended rules from @eslint-plugin-react
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    'plugin:jsx-a11y/recommended',
    'plugin:@next/next/recommended',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/naming-convention': [
      'error',
      { selector: 'default', format: null },
      { selector: 'enumMember', format: ['PascalCase'] },
      { selector: 'typeLike', format: ['PascalCase'] },
    ],
    'import/no-duplicates': 'error',
    'import/extensions': 'error',
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
          'object',
          'type',
        ],
        alphabetize: { order: 'asc' },
        'newlines-between': 'never',
        pathGroups: [
          {
            pattern: '{next,next/**,react}',
            group: 'external',
            position: 'before',
          },
          {
            pattern: '{src,pages,__tests__}/**',
            group: 'parent',
            position: 'before',
          },
        ],
      },
    ],
    'import/newline-after-import': 'error',
    'import/no-named-default': 'error',
    'import/no-named-as-default-member': 'off',
    'import/no-anonymous-default-export': 'error',
    'import/no-useless-path-segments': 'error',
    'import/dynamic-import-chunkname': 'error',
    'sort-imports': [
      'error',
      {
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
      },
    ],
    eqeqeq: 'error',
    'no-console': 'error',
    '@typescript-eslint/no-loss-of-precision': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    'react/jsx-no-useless-fragment': 'error',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      node: {
        paths: ['.'], // Allows to import url starting from 'src'
      },
    },
  },
  overrides: [
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    {
      files: ['*.stories.tsx', '*.test.tsx', '__tests__/**.*'],
      rules: {
        'import/no-anonymous-default-export': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        'jsx-a11y/anchor-is-valid': 'off',
        'jsx-a11y/click-events-have-key-events': 'off',
        'jsx-a11y/no-static-element-interactions': 'off',
      },
    },
    {
      files: ['onesky/**.ts'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
};
