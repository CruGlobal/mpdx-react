import { DateTime } from 'luxon';
import { buildAppealHref } from './appealHref';
import { buildCoachingHref } from './coachingHref';
import { buildContactHref } from './contactHref';
import { buildContactsListHref } from './contactsListHref';
import { buildDashboardHref } from './dashboardHref';
import {
  DEFAULT_VISIBILITY,
  NAVIGATION_INTENT_TYPES,
  NavigationIntentType,
  NavigationVisibility,
  STAFF_REPORT_NAMES,
} from './intents';
import { Params, hasOnlyKeys, isOneOf, isPlainObject } from './params';
import { buildReportHref } from './reportHref';
import { buildSettingsHref } from './settingsHref';
import { buildTasksHref } from './tasksHref';
import { buildToolsImportHref } from './toolsImportHref';
import { NavigationBuilder } from './types';

const BUILDERS: Record<NavigationIntentType, NavigationBuilder> = {
  contact: buildContactHref,
  contacts_list: buildContactsListHref,
  tasks: buildTasksHref,
  report: buildReportHref,
  appeal: buildAppealHref,
  tools_import: buildToolsImportHref,
  settings: buildSettingsHref,
  dashboard: buildDashboardHref,
  coaching: buildCoachingHref,
};

const getHiddenReason = (
  type: NavigationIntentType,
  params: Params,
  visibility: NavigationVisibility,
): string | null => {
  switch (type) {
    case 'coaching':
      return visibility.coaching ? null : 'coaching hidden';
    case 'report':
      if (!visibility.reports) {
        return 'reports hidden';
      }
      if (!visibility.coaching && params.name === 'coaching') {
        return 'coaching hidden';
      }
      if (
        !visibility.staff_features &&
        isOneOf(params.name, STAFF_REPORT_NAMES)
      ) {
        return 'staff_features hidden';
      }
      return null;
    case 'settings':
      return !visibility.hr_tools && params.tab === 'hr_tools'
        ? 'hr_tools hidden'
        : null;
    default:
      return null;
  }
};

// Only the type and a fixed reason are logged, so no model text reaches the console
const drop = (type: string, reason: string): null => {
  // eslint-disable-next-line no-console
  console.debug(
    `Assistant navigation intent dropped type=${type} reason=${reason}`,
  );
  return null;
};

export const buildNavigationHref = (
  intent: unknown,
  accountListId: string | null | undefined,
  visibility: Partial<NavigationVisibility> = DEFAULT_VISIBILITY,
  now: DateTime = DateTime.local(),
): string | null => {
  if (!isPlainObject(intent) || !hasOnlyKeys(intent, ['type', 'params'])) {
    return drop('unknown', 'not an intent');
  }
  const type = intent.type;
  const params = intent.params ?? {};
  if (!isOneOf(type, NAVIGATION_INTENT_TYPES)) {
    return drop('unknown', 'unknown type');
  }
  if (!isPlainObject(params)) {
    return drop(type, 'params not an object');
  }
  if (!accountListId) {
    return drop(type, 'no account list');
  }
  const hiddenReason = getHiddenReason(type, params, {
    ...DEFAULT_VISIBILITY,
    ...visibility,
  });
  if (hiddenReason) {
    return drop(type, hiddenReason);
  }

  const href = BUILDERS[type](params, {
    basePath: `/accountLists/${encodeURIComponent(accountListId)}`,
    now,
  });
  return href ?? drop(type, 'invalid params');
};
