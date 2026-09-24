import { testContext } from './buildContext.mock';
import { buildContactsListHref } from './contactsListHref';

const filtersOf = (href: string | null) => {
  expect(href).not.toBeNull();
  const url = new URL(href ?? '', 'https://mpdx.test');
  expect(url.pathname).toBe('/accountLists/account-list-1/contacts');
  return JSON.parse(url.searchParams.get('filters') ?? 'null');
};

const build = (...presets: unknown[]) =>
  buildContactsListHref({ presets }, testContext);

describe('buildContactsListHref', () => {
  it('links to all contacts without presets', () => {
    expect(buildContactsListHref({}, testContext)).toBe(
      '/accountLists/account-list-1/contacts',
    );
    expect(build()).toBe('/accountLists/account-list-1/contacts');
  });

  it.each([
    ['late_by_30', '2026-02-13'],
    ['late_by_60', '2026-01-14'],
    ['late_by_90', '2025-12-15'],
  ])(
    'maps %s to financial partners with a received pledge at least that many days late',
    (preset, max) => {
      expect(filtersOf(build({ preset }))).toEqual({
        lateAt: { min: '1970-01-01', max },
        status: ['PARTNER_FINANCIAL'],
        pledgeReceived: 'RECEIVED',
      });
    },
  );

  it('maps stopped_giving without a range to the past year up to a month ago', () => {
    expect(filtersOf(build({ preset: 'stopped_giving' }))).toEqual({
      stoppedGivingRange: { min: '2025-03-15', max: '2026-02-15' },
    });
  });

  it('maps stopped_giving with a range', () => {
    expect(
      filtersOf(build({ preset: 'stopped_giving', range: 'last_year' })),
    ).toEqual({ stoppedGivingRange: { min: '2025-01-01', max: '2025-12-31' } });
  });

  it('cuts stopped_giving last_month off a month ago, so mid-month it covers only half of last month', () => {
    expect(
      filtersOf(build({ preset: 'stopped_giving', range: 'last_month' })),
    ).toEqual({ stoppedGivingRange: { min: '2026-02-01', max: '2026-02-15' } });
  });

  it.each(['last_30_days', 'this_month'])(
    'returns null for stopped_giving in %s, which the API cannot filter',
    (range) => {
      expect(build({ preset: 'stopped_giving', range })).toBeNull();
    },
  );

  it('passes statuses through to the status filter', () => {
    expect(
      filtersOf(
        build({
          preset: 'status_in',
          values: [
            'PARTNER_FINANCIAL',
            'NEVER_CONTACTED',
            'EXPIRED_REFERRAL',
            'PARTNER_FINANCIAL',
          ],
        }),
      ),
    ).toEqual({
      status: ['PARTNER_FINANCIAL', 'NEVER_CONTACTED', 'EXPIRED_REFERRAL'],
    });
  });

  it.each([
    [['PHYSICAL'], 'PHYSICAL_ONLY'],
    [['EMAIL'], 'EMAIL_ONLY'],
    [['BOTH'], 'BOTH'],
    [['NONE'], 'NONE'],
    [['BOTH', 'PHYSICAL'], 'PHYSICAL'],
    [['EMAIL', 'BOTH'], 'EMAIL'],
    [['PHYSICAL', 'EMAIL', 'BOTH'], 'ALL'],
    [['PHYSICAL', 'PHYSICAL'], 'PHYSICAL_ONLY'],
  ])('maps newsletter %j to %s', (values, newsletter) => {
    expect(filtersOf(build({ preset: 'newsletter_in', values }))).toEqual({
      newsletter,
    });
  });

  it.each([
    [['PHYSICAL', 'EMAIL']],
    [['NONE', 'PHYSICAL']],
    [['PHYSICAL', 'EMAIL', 'BOTH', 'NONE']],
  ])(
    'returns null for newsletter %j, which the filter cannot express',
    (values) => {
      expect(build({ preset: 'newsletter_in', values })).toBeNull();
    },
  );

  it('maps pledge frequency labels to the filter values', () => {
    expect(
      filtersOf(
        build({
          preset: 'pledge_frequency_in',
          values: ['Monthly', 'Weekly', 'Monthly'],
        }),
      ),
    ).toEqual({ pledgeFrequency: ['1.0', '0.23076923076923'] });
  });

  it('combines presets', () => {
    expect(
      filtersOf(
        build(
          { preset: 'late_by_90' },
          { preset: 'pledge_frequency_in', values: ['Monthly'] },
        ),
      ),
    ).toEqual({
      lateAt: { min: '1970-01-01', max: '2025-12-15' },
      status: ['PARTNER_FINANCIAL'],
      pledgeReceived: 'RECEIVED',
      pledgeFrequency: ['1.0'],
    });
  });

  it.each([
    [
      'before',
      [
        { preset: 'late_by_30' },
        {
          preset: 'status_in',
          values: ['PARTNER_SPECIAL', 'PARTNER_FINANCIAL'],
        },
      ],
    ],
    [
      'after',
      [
        {
          preset: 'status_in',
          values: ['PARTNER_SPECIAL', 'PARTNER_FINANCIAL'],
        },
        { preset: 'late_by_30' },
      ],
    ],
  ])(
    'narrows status_in %s a late preset to financial partners',
    (_, presets) => {
      expect(filtersOf(build(...presets))).toEqual({
        lateAt: { min: '1970-01-01', max: '2026-02-13' },
        status: ['PARTNER_FINANCIAL'],
        pledgeReceived: 'RECEIVED',
      });
    },
  );

  it('returns null for a late preset with a status_in that excludes financial partners', () => {
    expect(
      build(
        { preset: 'late_by_60' },
        { preset: 'status_in', values: ['PARTNER_SPECIAL'] },
      ),
    ).toBeNull();
  });

  it.each([
    ['presets that are not a list', { presets: 'late_by_30' }],
    ['an unknown param', { presets: [], sort: 'name' }],
  ])('returns null for %s', (_, params) => {
    expect(buildContactsListHref(params, testContext)).toBeNull();
  });

  it.each([
    ['a preset that is not an object', 'late_by_30'],
    ['an unknown preset', { preset: 'late_by_120' }],
    ['a param on a late preset', { preset: 'late_by_30', days: 30 }],
    ['an unknown range', { preset: 'stopped_giving', range: 'forever' }],
    ['an unknown status', { preset: 'status_in', values: ['DONOR'] }],
    [
      'a status label',
      { preset: 'status_in', values: ['Partner - Financial'] },
    ],
    ['a filter-only status', { preset: 'status_in', values: ['HIDDEN'] }],
    ['an empty values list', { preset: 'status_in', values: [] }],
    [
      'values that are not a list',
      { preset: 'status_in', values: 'UNRESPONSIVE' },
    ],
    [
      'an unknown frequency',
      { preset: 'pledge_frequency_in', values: ['Daily'] },
    ],
    ['an unknown newsletter', { preset: 'newsletter_in', values: ['FAX'] }],
    ['a newsletter label', { preset: 'newsletter_in', values: ['Physical'] }],
  ])('returns null for %s', (_, preset) => {
    expect(build(preset)).toBeNull();
  });

  it('returns null for a repeated preset or two late presets', () => {
    expect(
      build({ preset: 'late_by_30' }, { preset: 'late_by_30' }),
    ).toBeNull();
    expect(
      build({ preset: 'late_by_30' }, { preset: 'late_by_90' }),
    ).toBeNull();
  });
});
