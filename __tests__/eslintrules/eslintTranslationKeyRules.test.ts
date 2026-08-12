import { LintMessage, lintSnippet, ruleFor } from './restrictedSyntaxHarness';

const nestedTRule = ruleFor("']) CallExpression:matches");
const staticKeyRule = ruleFor('.arguments:first-child');

const rawLint = (expression: string): LintMessage[] =>
  lintSnippet(
    `export const probe = ({ name, label, count, i18n, t }) =>\n  ${expression};`,
  );

const lintT = (expression: string): string[] =>
  rawLint(expression).map((message) => message.message);

describe('t() no-restricted-syntax rules', () => {
  // Severity 2 is `error`.
  it('reports violations as errors, not warnings', () => {
    expect(rawLint('t(label)')[0].severity).toBe(2);
  });

  it('flags a t() call nested in an interpolation value', () => {
    expect(
      lintT(
        `t('Are you sure you want to {{action}}?', { action: t('delete') })`,
      ),
    ).toEqual([nestedTRule.message]);
  });

  it('flags a nested i18n.t() call', () => {
    expect(lintT(`t('Hello {{name}}', { name: i18n.t('Friend') })`)).toEqual([
      nestedTRule.message,
    ]);
  });

  it('flags a t() call used as the key, which is also not static', () => {
    expect(lintT(`t(t('Ministry Partner'))`)).toEqual([
      nestedTRule.message,
      staticKeyRule.message,
    ]);
  });

  it('accepts sibling t() calls', () => {
    expect(lintT(`[t('One'), t('Two')]`)).toEqual([]);
  });

  it('accepts a t() call nested inside a call that is not t()', () => {
    expect(lintT(`String(t('One'))`)).toEqual([]);
  });

  it('flags a variable used as the key', () => {
    expect(lintT('t(label)')).toEqual([staticKeyRule.message]);
  });

  it('flags a template literal key with an expression', () => {
    expect(lintT('t(`Hello ${name}`)')).toEqual([staticKeyRule.message]);
  });

  it('flags a conditional used as the key', () => {
    expect(lintT(`t(count === 1 ? 'item' : 'items')`)).toEqual([
      staticKeyRule.message,
    ]);
  });

  it('flags a key concatenated with a variable', () => {
    expect(lintT(`t('Hello ' + name)`)).toEqual([staticKeyRule.message]);
  });

  it('accepts a string literal key', () => {
    expect(lintT(`t('Hello')`)).toEqual([]);
  });

  it('accepts a template literal key with no expressions', () => {
    expect(lintT('t(`Hello`)')).toEqual([]);
  });

  // `yarn extract` joins concatenated literals into a single key, so splitting a
  // long sentence across lines is safe.
  it('accepts string literals concatenated for line length', () => {
    expect(
      lintT(`t('A sentence long enough that it is ' + 'split across lines')`),
    ).toEqual([]);
  });

  it('accepts dynamic interpolation values in the second argument', () => {
    expect(lintT(`t('Hello {{name}}', { name })`)).toEqual([]);
  });

  it('accepts a static key on i18n.t()', () => {
    expect(lintT(`i18n.t('Hello')`)).toEqual([]);
  });

  it('flags a dynamic key on i18n.t()', () => {
    expect(lintT('i18n.t(label)')).toEqual([staticKeyRule.message]);
  });

  it('flags a key widened with a TypeScript cast', () => {
    expect(lintT('t(label as string)')).toEqual([staticKeyRule.message]);
  });
});
