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
      // `yarn extract` can only collect a key it can resolve statically.
      {
        selector:
          "CallExpression:matches([callee.name='t'], [callee.property.name='t']) > .arguments:first-child:not(Literal, TemplateLiteral[expressions.length=0], BinaryExpression:not(:has(:not(Literal, BinaryExpression))))",
        message:
          "Translation keys must be statically resolvable so `yarn extract` can find them. For dynamic values, use interpolation (e.g. `t('Name: {{name}}', { name })`). For dynamic keys, use separate `t()` calls.",
      },
      {
        selector:
          "JSXOpeningElement[name.name='Trans'] > JSXAttribute[name.name='i18nKey']",
        message:
          'Do not pass i18nKey to <Trans>. `yarn extract` writes the id as its own value, so the English never reaches translation.json. Drop i18nKey and let the children be the key.',
      },
      {
        selector:
          "JSXOpeningElement[name.name='Trans']:not(:has(JSXAttribute[name.name='t'][parent.name.name='Trans']))",
        message:
          '<Trans> must be passed a t={t} prop from useTranslation() so it resolves keys against the component i18n instance.',
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
