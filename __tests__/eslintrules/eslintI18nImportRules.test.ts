import eslintConfig from '../../.eslintrc';
import { importRuleFor, lintImportSnippet } from './restrictedSyntaxHarness';

const i18nRule = importRuleFor('i18n');

// no-restricted-imports prefixes the configured message with its own sentence,
// unlike no-restricted-syntax which reports the message verbatim.
const restricted = (specifier: string): string =>
  `'${specifier}' import is restricted from being used by a pattern. ${i18nRule.message}`;

const lintImport = (code: string): string[] =>
  lintImportSnippet(code).map((message) => message.message);

const exemptedPaths = (eslintConfig.overrides ?? [])
  .filter((override) => override.rules?.['no-restricted-imports'] === 'off')
  .flatMap((override) => override.files);

describe('i18n singleton no-restricted-imports rule', () => {
  it('flags the singleton imported by its src path', () => {
    expect(lintImport("import i18n from 'src/lib/i18n';")).toEqual([
      restricted('src/lib/i18n'),
    ]);
  });

  it('flags the singleton imported from a parent directory', () => {
    expect(lintImport("import i18n from '../i18n';")).toEqual([
      restricted('../i18n'),
    ]);
  });

  it('flags the singleton imported from a sibling directory', () => {
    expect(lintImport("import i18n from './i18n';")).toEqual([
      restricted('./i18n'),
    ]);
  });

  it('flags a named import from the singleton', () => {
    expect(lintImport("import { t } from 'src/lib/i18n';")).toEqual([
      restricted('src/lib/i18n'),
    ]);
  });

  it('accepts the TFunction type from i18next', () => {
    expect(lintImport("import { TFunction } from 'i18next';")).toEqual([]);
  });

  it('accepts useTranslation from react-i18next', () => {
    expect(
      lintImport("import { useTranslation } from 'react-i18next';"),
    ).toEqual([]);
  });

  it('accepts an unrelated src import', () => {
    expect(lintImport("import theme from 'src/theme';")).toEqual([]);
  });

  it('exempts only pages and test helpers', () => {
    expect(exemptedPaths).toEqual([
      'pages/**',
      '*.test.ts',
      '*.test.tsx',
      '__tests__/**',
      'testUtils.tsx',
      '*TestWrapper.tsx',
    ]);
  });
});
