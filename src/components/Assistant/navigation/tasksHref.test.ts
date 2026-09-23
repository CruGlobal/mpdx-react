import { testContext } from './buildContext.mock';
import { buildTasksHref } from './tasksHref';

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

  it.each([
    ['overdue', { completed: false, dateRange: 'overdue' }],
    ['completed', { completed: true }],
    ['today', { completed: false, dateRange: 'today' }],
    ['upcoming', { completed: false, dateRange: 'upcoming' }],
    ['no_due_date', { completed: false, dateRange: 'no_date' }],
  ])('sets the filters the %s quick tab sets', (preset, filters) => {
    const href = buildTasksHref({ preset }, testContext);

    expect(href).toMatch(/^\/accountLists\/account-list-1\/tasks\?filters=/);
    expect(filtersOf(href)).toEqual(filters);
  });

  it.each([
    ['an unknown preset', { preset: 'someday' }],
    ['an unknown param', { preset: 'all', page: 2 }],
  ])('returns null for %s', (_, params) => {
    expect(buildTasksHref(params, testContext)).toBeNull();
  });
});
