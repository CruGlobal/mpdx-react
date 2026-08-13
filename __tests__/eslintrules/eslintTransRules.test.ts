import { lintSnippet, ruleFor } from './restrictedSyntaxHarness';

const i18nKeyRule = ruleFor("JSXAttribute[name.name='i18nKey']");
const missingTRule = ruleFor("[parent.name.name='Trans']");

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

describe('<Trans> t prop no-restricted-syntax rule', () => {
  it('flags a <Trans> with no t prop', () => {
    expect(lintTrans('<Trans>All set</Trans>')).toEqual([missingTRule.message]);
  });

  it('flags a self-closing <Trans> with no t prop', () => {
    expect(
      lintTrans('<Trans defaults="Hello {{ name }}" values={{ name }} />'),
    ).toEqual([missingTRule.message]);
  });

  it('flags a nested <Trans> with no t prop', () => {
    expect(
      lintTrans('<Trans t={t}>Hello <Trans>there</Trans></Trans>'),
    ).toEqual([missingTRule.message]);
  });

  it('flags a <Trans> whose only t prop is on a nested element in an attribute value', () => {
    expect(
      lintTrans('<Trans components={{ bold: <Link t={t} /> }}>Hello</Trans>'),
    ).toEqual([missingTRule.message]);
  });

  it('flags a <Trans> passed as another component prop', () => {
    expect(
      lintTrans('<Confirmation message={<Trans>Are you sure?</Trans>} />'),
    ).toEqual([missingTRule.message]);
  });

  it('flags every <Trans> that is missing t, not just the first', () => {
    expect(
      lintTrans(
        '<><Trans>One</Trans><Trans t={t}>Two</Trans><Trans>Three</Trans></>',
      ),
    ).toEqual([missingTRule.message, missingTRule.message]);
  });

  it('accepts a <Trans> that is passed t', () => {
    expect(lintTrans('<Trans t={t}>All set</Trans>')).toEqual([]);
  });

  it('accepts a t prop bound to a differently named function', () => {
    expect(lintTrans('<Trans t={translate}>All set</Trans>')).toEqual([]);
  });

  it('accepts a t prop bound to a member expression', () => {
    expect(lintTrans('<Trans t={i18n.t}>All set</Trans>')).toEqual([]);
  });

  it('accepts a <Trans> passed as another component prop with t', () => {
    expect(
      lintTrans(
        '<Confirmation message={<Trans t={t}>Are you sure?</Trans>} />',
      ),
    ).toEqual([]);
  });

  it('accepts a component that is not <Trans> with no t prop', () => {
    expect(lintTrans('<Typography>All set</Typography>')).toEqual([]);
  });

  it('accepts a component whose name merely starts with Trans', () => {
    expect(lintTrans('<Transition>All set</Transition>')).toEqual([]);
  });
});
