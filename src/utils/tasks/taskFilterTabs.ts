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
  translated: boolean;
  activeFiltersOptions: {
    completed: boolean | null;
    dateRange: string | null;
  };
}

export const taskFiltersTabs: TaskFilterTabsObject[] = [
  {
    name: 'All',
    uiName: 'All Tasks',
    translated: false,
    activeFiltersOptions: {
      completed: null,
      dateRange: null,
    },
  },
  {
    name: 'Overdue',
    uiName: 'Overdue',
    translated: true,
    activeFiltersOptions: {
      completed: false,
      dateRange: 'overdue',
    },
  },
  {
    name: 'Completed',
    uiName: 'Completed',
    translated: true,
    activeFiltersOptions: {
      completed: true,
      dateRange: null,
    },
  },
  {
    name: 'Today',
    uiName: 'Today',
    translated: true,
    activeFiltersOptions: {
      completed: false,
      dateRange: 'today',
    },
  },
  {
    name: 'Upcoming',
    uiName: 'Upcoming',
    translated: true,
    activeFiltersOptions: {
      completed: false,
      dateRange: 'upcoming',
    },
  },
  {
    name: 'NoDueDate',
    uiName: 'No Due Date',
    translated: true,
    activeFiltersOptions: {
      completed: false,
      dateRange: 'no_date',
    },
  },
];
