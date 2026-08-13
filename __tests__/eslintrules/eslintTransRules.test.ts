import { lintSnippet, ruleFor } from './restrictedSyntaxHarness';

const i18nKeyRule = ruleFor("JSXAttribute[name.name='i18nKey']");

const lintTrans = (body: string): string[] =>
  lintSnippet(`export const Probe = ({ name, t }) => (\n  ${body}\n);`).map(
    (message) => message.message,
  );

describe('<Trans> i18nKey no-restricted-syntax rule', () => {
  it('flags i18nKey on <Trans>', () => {
    expect(
      lintTrans(
        `<Trans t={t} i18nKey="fairRentalValueQuestion1">This is a reasonable amount.</Trans>`,
      ),
    ).toEqual([i18nKeyRule.message]);
  });

  it('flags i18nKey on a self-closing <Trans>', () => {
    expect(
      lintTrans(
        `<Trans t={t} i18nKey="greeting" defaults="Hello {{ name }}" values={{ name }} />`,
      ),
    ).toEqual([i18nKeyRule.message]);
  });

  it('accepts a <Trans> with no i18nKey', () => {
    expect(
      lintTrans('<Trans t={t}>This is a reasonable amount.</Trans>'),
    ).toEqual([]);
  });

  it('accepts other <Trans> props', () => {
    expect(
      lintTrans('<Trans t={t} values={{ name }}>Hello {{ name }}</Trans>'),
    ).toEqual([]);
  });

  it('accepts i18nKey on a component that is not <Trans>', () => {
    expect(
      lintTrans('<Typography i18nKey="greeting">Hello</Typography>'),
    ).toEqual([]);
  });

  it('flags an i18nKey whose value is a TypeScript cast', () => {
    expect(
      lintTrans('<Trans t={t} i18nKey={name as string}>Hello</Trans>'),
    ).toEqual([i18nKeyRule.message]);
  });
});
