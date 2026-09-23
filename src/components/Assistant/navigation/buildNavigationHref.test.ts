import { DateTime } from 'luxon';
import { buildNavigationHref } from './buildNavigationHref';

const accountListId = 'account-list-1';
const now = DateTime.fromISO('2026-03-15T10:00:00');

describe('buildNavigationHref', () => {
  let debugSpy: jest.SpyInstance;

  beforeEach(() => {
    debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    debugSpy.mockRestore();
  });

  it('builds the href for a valid intent', () => {
    expect(
      buildNavigationHref(
        { type: 'settings', params: { tab: 'connect_services' } },
        accountListId,
      ),
    ).toBe('/accountLists/account-list-1/settings/integrations');
    expect(debugSpy).not.toHaveBeenCalled();
  });

  it('treats missing params as empty', () => {
    expect(buildNavigationHref({ type: 'dashboard' }, accountListId)).toBe(
      '/accountLists/account-list-1',
    );
  });

  it('treats null params as empty, like the server', () => {
    expect(
      buildNavigationHref({ type: 'dashboard', params: null }, accountListId),
    ).toBe('/accountLists/account-list-1');
    expect(debugSpy).not.toHaveBeenCalled();
  });

  it('passes the current time to date-based builders', () => {
    expect(
      buildNavigationHref(
        { type: 'report', params: { name: 'donations', range: 'last_month' } },
        accountListId,
        undefined,
        now,
      ),
    ).toBe('/accountLists/account-list-1/reports/donations?month=2026-02-01');
  });

  it('encodes the account list id', () => {
    expect(buildNavigationHref({ type: 'dashboard' }, 'a/b')).toBe(
      '/accountLists/a%2Fb',
    );
  });

  it.each([
    ['a non-object intent', 'dashboard', 'unknown'],
    ['an unknown type', { type: 'url', params: {} }, 'unknown'],
    [
      'an extra intent key',
      { type: 'dashboard', params: {}, href: '/' },
      'unknown',
    ],
    [
      'params that are not an object',
      { type: 'dashboard', params: [] },
      'dashboard',
    ],
    [
      'invalid params',
      { type: 'tasks', params: { preset: 'someday' } },
      'tasks',
    ],
  ])('returns null and logs once for %s', (_, intent, type) => {
    expect(buildNavigationHref(intent, accountListId)).toBeNull();
    expect(debugSpy).toHaveBeenCalledTimes(1);
    expect(debugSpy.mock.calls[0][0]).toContain(`type=${type}`);
  });

  it('logs no page rather than invalid params for the HR Tools tab', () => {
    expect(
      buildNavigationHref(
        { type: 'settings', params: { tab: 'hr_tools' } },
        accountListId,
      ),
    ).toBeNull();
    expect(debugSpy).toHaveBeenCalledWith(
      'Assistant navigation intent dropped type=settings reason=no page',
    );
  });

  it('returns null without an account list', () => {
    expect(buildNavigationHref({ type: 'dashboard' }, null)).toBeNull();
    expect(debugSpy).toHaveBeenCalledTimes(1);
  });

  it('never logs model text', () => {
    buildNavigationHref(
      { type: 'appeal', params: { id: 'secret text from the model' } },
      accountListId,
    );

    expect(debugSpy.mock.calls[0][0]).not.toContain('secret');
  });

  describe('visibility', () => {
    it.each([
      [{ coaching: false }, { type: 'coaching', params: {} }],
      [{ coaching: false }, { type: 'report', params: { name: 'coaching' } }],
      [{ reports: false }, { type: 'report', params: { name: 'donations' } }],
      [
        { staff_features: false },
        { type: 'report', params: { name: 'staff_expense' } },
      ],
      [
        { staff_features: false },
        { type: 'report', params: { name: 'mpga_income_expenses' } },
      ],
      [{ hr_tools: false }, { type: 'settings', params: { tab: 'hr_tools' } }],
    ])('suppresses the intent when %j', (visibility, intent) => {
      expect(
        buildNavigationHref(intent, accountListId, { visibility }),
      ).toBeNull();
      expect(debugSpy.mock.calls[0][0]).toContain('hidden');
    });

    it.each([
      [{ coaching: false }, { type: 'report', params: { name: 'donations' } }],
      [
        { staff_features: false },
        { type: 'report', params: { name: 'donations' } },
      ],
      [
        { hr_tools: false },
        { type: 'settings', params: { tab: 'preferences' } },
      ],
      [{ reports: false }, { type: 'coaching', params: {} }],
    ])('keeps unrelated intents when %j', (visibility, intent) => {
      expect(
        buildNavigationHref(intent, accountListId, { visibility }),
      ).not.toBeNull();
    });

    it('suppresses a report the nav does not list', () => {
      expect(
        buildNavigationHref(
          { type: 'report', params: { name: 'financial_accounts' } },
          accountListId,
          { reportSegments: new Set(['donations']) },
        ),
      ).toBeNull();
      expect(debugSpy).toHaveBeenCalledWith(
        'Assistant navigation intent dropped type=report reason=report hidden',
      );
    });

    it('keeps a report the nav lists', () => {
      expect(
        buildNavigationHref(
          { type: 'report', params: { name: 'financial_accounts' } },
          accountListId,
          { reportSegments: new Set(['financialAccounts']) },
        ),
      ).toBe('/accountLists/account-list-1/reports/financialAccounts');
    });

    it('shows everything by default', () => {
      expect(
        buildNavigationHref(
          { type: 'report', params: { name: 'staff_expense' } },
          accountListId,
        ),
      ).toBe('/accountLists/account-list-1/reports/staffExpense');
    });
  });
});
