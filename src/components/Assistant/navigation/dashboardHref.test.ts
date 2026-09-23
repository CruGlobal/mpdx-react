import { testContext } from './buildContext.mock';
import { buildDashboardHref } from './dashboardHref';

describe('buildDashboardHref', () => {
  it('links to the account list dashboard', () => {
    expect(buildDashboardHref({}, testContext)).toBe(
      '/accountLists/account-list-1',
    );
  });

  it('returns null for an unknown param', () => {
    expect(buildDashboardHref({ tab: 'giving' }, testContext)).toBeNull();
  });
});
