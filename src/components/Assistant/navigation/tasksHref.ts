import { TASK_PRESETS, TaskPreset } from './intents';
import { hasOnlyKeys, isOneOf } from './params';
import { NavigationBuilder } from './types';

// The filters each Tasks quick tab sets, from src/lib/tasks/taskFilterTabs.ts
export const TASK_TAB_FILTERS: Record<
  TaskPreset,
  { completed?: boolean; dateRange?: string }
> = {
  all: {},
  overdue: { completed: false, dateRange: 'overdue' },
  completed: { completed: true },
  today: { completed: false, dateRange: 'today' },
  upcoming: { completed: false, dateRange: 'upcoming' },
  no_due_date: { completed: false, dateRange: 'no_date' },
};

export const buildTasksHref: NavigationBuilder = (params, { basePath }) => {
  if (!hasOnlyKeys(params, ['preset'])) {
    return null;
  }
  const { preset = 'all' } = params;
  if (!isOneOf(preset, TASK_PRESETS)) {
    return null;
  }
  const filters = TASK_TAB_FILTERS[preset];
  const path = `${basePath}/tasks`;
  return Object.keys(filters).length
    ? `${path}?filters=${encodeURIComponent(JSON.stringify(filters))}`
    : path;
};
