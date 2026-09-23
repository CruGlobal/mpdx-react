import { TFunction } from 'react-i18next';
import { getTaskFiltersTabs } from 'src/lib/tasks/taskFilterTabs';
import { testContext } from './buildContext.mock';
import { TASK_TAB_FILTERS, buildTasksHref } from './tasksHref';

const filtersOf = (href: string | null) =>
  JSON.parse(
    new URL(href ?? '', 'https://mpdx.test').searchParams.get('filters') ??
      'null',
  );

describe('buildTasksHref', () => {
  it('links to all tasks without a preset or with all', () => {
    expect(buildTasksHref({}, testContext)).toBe(
      '/accountLists/account-list-1/tasks',
    );
    expect(buildTasksHref({ preset: 'all' }, testContext)).toBe(
      '/accountLists/account-list-1/tasks',
    );
  });

  it('sets the quick tab filters', () => {
    const href = buildTasksHref({ preset: 'overdue' }, testContext);

    expect(href).toMatch(/^\/accountLists\/account-list-1\/tasks\?filters=/);
    expect(filtersOf(href)).toEqual({ completed: false, dateRange: 'overdue' });
    expect(
      filtersOf(buildTasksHref({ preset: 'no_due_date' }, testContext)),
    ).toEqual({ completed: false, dateRange: 'no_date' });
  });

  it('matches the filters the quick tabs set', () => {
    const t = ((key: string) => key) as unknown as TFunction;
    const tabs = getTaskFiltersTabs(t).map(({ activeFiltersOptions }) =>
      Object.fromEntries(
        Object.entries(activeFiltersOptions).filter(
          ([, value]) => value !== null,
        ),
      ),
    );

    expect(Object.values(TASK_TAB_FILTERS)).toEqual(tabs);
  });

  it.each([
    ['an unknown preset', { preset: 'someday' }],
    ['an unknown param', { preset: 'all', page: 2 }],
  ])('returns null for %s', (_, params) => {
    expect(buildTasksHref(params, testContext)).toBeNull();
  });
});
