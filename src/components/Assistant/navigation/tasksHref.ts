import { TFunction } from 'react-i18next';
import {
  TaskFilterTabsTypes,
  getTaskFiltersTabs,
} from 'src/lib/tasks/taskFilterTabs';
import { TASK_PRESETS, TaskPreset } from './intents';
import { hasOnlyKeys, isOneOf } from './params';
import { NavigationBuilder } from './types';

const TASK_TAB_NAMES: Record<TaskPreset, TaskFilterTabsTypes> = {
  all: 'All',
  overdue: 'Overdue',
  completed: 'Completed',
  today: 'Today',
  upcoming: 'Upcoming',
  no_due_date: 'NoDueDate',
};

// Only the filters are read, so the tab labels need no real translation
const TASK_TABS = getTaskFiltersTabs(
  ((key: string) => key) as unknown as TFunction,
);

const getTabFilters = (preset: TaskPreset): Record<string, unknown> => {
  const tab = TASK_TABS.find(({ name }) => name === TASK_TAB_NAMES[preset]);
  return Object.fromEntries(
    Object.entries(tab?.activeFiltersOptions ?? {}).filter(
      ([, value]) => value !== null,
    ),
  );
};

export const buildTasksHref: NavigationBuilder = (params, { basePath }) => {
  if (!hasOnlyKeys(params, ['preset'])) {
    return null;
  }
  const { preset = 'all' } = params;
  if (!isOneOf(preset, TASK_PRESETS)) {
    return null;
  }
  const filters = getTabFilters(preset);
  const path = `${basePath}/tasks`;
  return Object.keys(filters).length
    ? `${path}?filters=${encodeURIComponent(JSON.stringify(filters))}`
    : path;
};
