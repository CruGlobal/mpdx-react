import { testContext } from './buildContext.mock';
import { REPORT_NAMES } from './intents';
import { buildReportHref } from './reportHref';

describe('buildReportHref', () => {
  it.each([
    ['donations', 'donations'],
    ['partner_currency', 'partnerCurrency'],
    ['salary_currency', 'salaryCurrency'],
    ['staff_expense', 'staffExpense'],
    ['mpga_income_expenses', 'mpgaIncomeExpenses'],
    ['designation_accounts', 'designationAccounts'],
    ['financial_accounts', 'financialAccounts'],
    ['expected_monthly_total', 'expectedMonthlyTotal'],
    ['partner_giving_analysis', 'partnerGivingAnalysis'],
    ['coaching', 'coaching'],
  ])('links %s to its route segment', (name, segment) => {
    expect(buildReportHref({ name }, testContext)).toBe(
      `/accountLists/account-list-1/reports/${segment}`,
    );
  });

  it('covers every report name', () => {
    REPORT_NAMES.forEach((name) =>
      expect(buildReportHref({ name }, testContext)).not.toBeNull(),
    );
  });

  it('opens the donations report on a single month range', () => {
    expect(
      buildReportHref({ name: 'donations', range: 'last_month' }, testContext),
    ).toBe('/accountLists/account-list-1/reports/donations?month=2026-02-01');
    expect(
      buildReportHref({ name: 'donations', range: 'this_month' }, testContext),
    ).toBe('/accountLists/account-list-1/reports/donations?month=2026-03-01');
  });

  it('drops a range the report does not read from the URL', () => {
    expect(
      buildReportHref({ name: 'donations', range: 'last_year' }, testContext),
    ).toBe('/accountLists/account-list-1/reports/donations');
    expect(
      buildReportHref(
        { name: 'partner_currency', range: 'last_month' },
        testContext,
      ),
    ).toBe('/accountLists/account-list-1/reports/partnerCurrency');
  });

  it.each([
    ['a missing name', {}],
    ['an unknown name', { name: 'giving' }],
    ['an unknown range', { name: 'donations', range: 'forever' }],
    ['an unknown param', { name: 'donations', month: '2026-01' }],
  ])('returns null for %s', (_, params) => {
    expect(buildReportHref(params, testContext)).toBeNull();
  });
});
