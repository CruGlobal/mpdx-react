import { SETTINGS_TABS, SettingsTab } from './intents';
import { hasOnlyKeys, isOneOf } from './params';
import { NavigationBuilder } from './types';

// HR Tools has no landing page, only the individual tools, so it cannot be linked yet
export const SETTINGS_PATHS: Record<SettingsTab, string | null> = {
  preferences: '/settings/preferences',
  notifications: '/settings/notifications',
  connect_services: '/settings/integrations',
  manage_accounts: '/settings/manageAccounts',
  manage_coaches: '/settings/manageCoaches',
  hr_tools: null,
};

export const isSettingsTabWithoutPage = (tab: unknown): boolean =>
  isOneOf(tab, SETTINGS_TABS) && SETTINGS_PATHS[tab] === null;

export const buildSettingsHref: NavigationBuilder = (params, { basePath }) => {
  if (!hasOnlyKeys(params, ['tab']) || !isOneOf(params.tab, SETTINGS_TABS)) {
    return null;
  }
  const path = SETTINGS_PATHS[params.tab];
  return path && `${basePath}${path}`;
};
