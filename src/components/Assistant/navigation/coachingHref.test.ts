import { testContext } from './buildContext.mock';
import { buildCoachingHref } from './coachingHref';

describe('buildCoachingHref', () => {
  it('links to the coaching page', () => {
    expect(buildCoachingHref({}, testContext)).toBe(
      '/accountLists/account-list-1/coaching',
    );
  });

  it('returns null for an unknown param', () => {
    expect(buildCoachingHref({ id: 'coachee-1' }, testContext)).toBeNull();
  });
});
