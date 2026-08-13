import { Linter } from 'eslint';
import eslintConfig from '../../.eslintrc';

interface RestrictedSyntaxOption {
  selector: string;
  message: string;
}

// Assert against the real rules so these tests survive wording changes and fail
// if a selector is narrowed.
const restrictedSyntax = eslintConfig.rules['no-restricted-syntax'] as [
  'error',
  RestrictedSyntaxOption,
  RestrictedSyntaxOption,
];
const [, missingTRule, singleBraceRule] = restrictedSyntax;

const linter = new Linter();

const lintTrans = (body: string): string[] =>
  linter
    .verify(`export const Probe = ({ name, url, t }) => (\n  ${body}\n);`, {
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      rules: { 'no-restricted-syntax': restrictedSyntax },
    })
    .filter((message) => message.ruleId === 'no-restricted-syntax')
    .map((message) => message.message);

describe('<Trans> no-restricted-syntax rules', () => {
  it('flags a <Trans> with no t prop', () => {
    expect(lintTrans('<Trans>All set</Trans>')).toEqual([missingTRule.message]);
  });

  it('flags a self-closing <Trans> with no t prop', () => {
    expect(
      lintTrans('<Trans defaults="Hello {{name}}" values={{ name }} />'),
    ).toEqual([missingTRule.message]);
  });

  it('accepts a <Trans> that is passed t', () => {
    expect(lintTrans('<Trans t={t}>All set</Trans>')).toEqual([]);
  });

  it('flags a single-brace interpolation', () => {
    expect(lintTrans('<Trans t={t}>Hello {name}</Trans>')).toEqual([
      singleBraceRule.message,
    ]);
  });

  it('flags a single-brace interpolation nested inside a child element', () => {
    expect(lintTrans('<Trans t={t}><Box>Hello {name}</Box></Trans>')).toEqual([
      singleBraceRule.message,
    ]);
  });

  it('flags a t() call used as a child', () => {
    expect(lintTrans(`<Trans t={t}>{t('Hello')}</Trans>`)).toEqual([
      singleBraceRule.message,
    ]);
  });

  it('accepts double-brace interpolation', () => {
    expect(
      lintTrans('<Trans t={t} values={{ name }}>Hello {{ name }}</Trans>'),
    ).toEqual([]);
  });

  /*
   * react-i18next supports nested JSX/interpolation: nodesToString recursively
   * serializes nested nodes, and the Trans rendering path resolves interpolation
   * values recursively. The JSX form {{ name }} is different: it is parsed as an
   * object literal ({ name }) inside a JSX expression container, so it is not a
   * ReactNode and TypeScript rejects it when <Box>'s children prop is ReactNode.
   */
  it('does not flag nested double-brace interpolation, which only TypeScript rejects', () => {
    expect(
      lintTrans('<Trans t={t}><Box>Hello {{ name }}</Box></Trans>'),
    ).toEqual([]);
  });

  it('accepts a string literal child such as a whitespace separator', () => {
    expect(lintTrans(`<Trans t={t}>Hello{' '}<b>there</b></Trans>`)).toEqual(
      [],
    );
  });

  it('accepts an expression in a nested element attribute', () => {
    expect(
      lintTrans('<Trans t={t}><Link href={url}>Docs</Link></Trans>'),
    ).toEqual([]);
  });
});
