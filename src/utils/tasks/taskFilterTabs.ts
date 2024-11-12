import { TFunction } from 'react-i18next';

export type TaskFilterTabsTypes =
  | 'All'
  | 'Overdue'
  | 'Completed'
  | 'Today'
  | 'Upcoming'
  | 'NoDueDate';

interface TaskFilterTabsObject {
  name: TaskFilterTabsTypes;
  uiName: string;
  activeFiltersOptions: {
    completed: boolean | null;
    dateRange: string | null;
  };
}

export const getTaskFiltersTabs = (t: TFunction): TaskFilterTabsObject[] => [
  {
    name: 'All',
    uiName: t('All Tasks'),
    activeFiltersOptions: {
      completed: null,
      dateRange: null,
    },
  },
  {
    name: 'Overdue',
    uiName: t('Overdue'),
    activeFiltersOptions: {
      completed: false,
      dateRange: 'overdue',
    },
  },
  {
    name: 'Completed',
    uiName: t('Completed'),
    activeFiltersOptions: {
      completed: true,
      dateRange: null,
    },
  },
  {
    name: 'Today',
    uiName: t('Today'),
    activeFiltersOptions: {
      completed: false,
      dateRange: 'today',
    },
  },
  {
    name: 'Upcoming',
    uiName: t('Upcoming'),
    activeFiltersOptions: {
      completed: false,
      dateRange: 'upcoming',
    },
  },
  {
    name: 'NoDueDate',
    uiName: t('No Due Date'),
    activeFiltersOptions: {
      completed: false,
      dateRange: 'no_date',
    },
  },
];
