import { testContext } from './buildContext.mock';
import { buildSettingsHref } from './settingsHref';

describe('buildSettingsHref', () => {
  it.each([
    ['preferences', '/settings/preferences'],
    ['notifications', '/settings/notifications'],
    ['connect_services', '/settings/integrations'],
    ['manage_accounts', '/settings/manageAccounts'],
    ['manage_coaches', '/settings/manageCoaches'],
  ])('links %s to %s', (tab, path) => {
    expect(buildSettingsHref({ tab }, testContext)).toBe(
      `/accountLists/account-list-1${path}`,
    );
  });

  it('returns null for hr_tools because HR Tools has no landing page', () => {
    expect(buildSettingsHref({ tab: 'hr_tools' }, testContext)).toBeNull();
  });

  it.each([
    ['a missing tab', {}],
    ['an unknown tab', { tab: 'admin' }],
    ['an unknown param', { tab: 'preferences', section: 'locale' }],
  ])('returns null for %s', (_, params) => {
    expect(buildSettingsHref(params, testContext)).toBeNull();
  });
});
