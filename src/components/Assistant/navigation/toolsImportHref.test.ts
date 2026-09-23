import { testContext } from './buildContext.mock';
import { buildToolsImportHref } from './toolsImportHref';

describe('buildToolsImportHref', () => {
  it.each(['csv', 'google', 'tnt'])('links to the %s import', (source) => {
    expect(buildToolsImportHref({ source }, testContext)).toBe(
      `/accountLists/account-list-1/tools/import/${source}`,
    );
  });

  it.each([
    ['a missing source', {}],
    ['an unknown source', { source: 'mailchimp' }],
    ['an unknown param', { source: 'csv', step: 2 }],
  ])('returns null for %s', (_, params) => {
    expect(buildToolsImportHref(params, testContext)).toBeNull();
  });
});
