module.exports = {
  root: true, // Stop ESLint from also loading configs above this directory (breaks nested git worktrees)
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
    'no-restricted-syntax': [
      'error',
      {
        selector:
          "JSXOpeningElement[name.name='Trans']:not(:has(JSXAttribute[name.name='t']))",
        message:
          '<Trans> must be passed a t={t} prop from useTranslation() so it resolves keys against the component i18n instance.',
      },
      {
        /* i18next interpolates {{ name }}, not {name}. A bare {name} child is a
         * plain value at runtime, so it lands in the extracted key and the
         * lookup can never match.
         * Includes Trans and children of Trans, and determines if the descendent matches an
         * Identifier (e.g. {name}), MemberExpression (e.g. {user.name}), or CallExpression (e.g. {getName()})
         */
        selector:
          ":matches(JSXElement[openingElement.name.name='Trans'], JSXElement[openingElement.name.name='Trans'] JSXElement) > JSXExpressionContainer > :matches(Identifier, MemberExpression, CallExpression)",
        message:
          'Single-brace {name} inside <Trans> becomes part of the extracted key, so the lookup never matches. Use {{ name }} which only typechecks as a direct child of <Trans>, so if this sits inside a nested element, move that element outside the <Trans> instead.',
      },
    ],
    curly: 'error',
    eqeqeq: 'error',
    'no-console': 'error',
    'no-debugger': 'error',
    'no-empty': 'error',
    '@typescript-eslint/no-loss-of-precision': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    'no-restricted-syntax': [
      'error',
      {
        selector:
          "CallExpression:matches([callee.name='t'], [callee.property.name='t']) CallExpression:matches([callee.name='t'], [callee.property.name='t'])",
        message:
          'Do not nest t() inside t(). Prefer a separate full sentence per variant; if the value is dynamic, assign the inner t() to a variable first.',
      },
    ],
    'react/jsx-no-useless-fragment': 'error',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'jsx-a11y/no-autofocus': 'off',
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
      files: ['*.test.tsx', '__tests__/**.*'],
      rules: {
        'import/no-anonymous-default-export': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        'jsx-a11y/anchor-is-valid': 'off',
        'jsx-a11y/click-events-have-key-events': 'off',
        'jsx-a11y/no-static-element-interactions': 'off',
      },
    },
  ],
};
