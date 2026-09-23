import { buildAppealHref } from './appealHref';
import { testContext } from './buildContext.mock';

const appealId = '851769ba-b55d-45f3-b784-c4eca7ae99fd';

describe('buildAppealHref', () => {
  it('links to the appeal with an id', () => {
    expect(buildAppealHref({ id: appealId }, testContext)).toBe(
      `/accountLists/account-list-1/tools/appeals/appeal/${appealId}`,
    );
  });

  it('links to the appeals list without an id', () => {
    expect(buildAppealHref({}, testContext)).toBe(
      '/accountLists/account-list-1/tools/appeals',
    );
  });

  it.each([
    ['an id that is not a uuid', { id: 'https://evil.test' }],
    ['an id that is not a string', { id: 7 }],
    ['an unknown param', { id: appealId, view: 'list' }],
  ])('returns null for %s', (_, params) => {
    expect(buildAppealHref(params, testContext)).toBeNull();
  });
});
