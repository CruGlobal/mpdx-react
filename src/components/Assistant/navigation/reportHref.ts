import { RANGES, REPORT_NAMES, ReportName } from './intents';
import { hasOnlyKeys, isOneOf } from './params';
import { NavigationBuilder } from './types';

export const REPORT_SEGMENTS: Record<ReportName, string> = {
  donations: 'donations',
  partner_currency: 'partnerCurrency',
  salary_currency: 'salaryCurrency',
  staff_expense: 'staffExpense',
  mpga_income_expenses: 'mpgaIncomeExpenses',
  designation_accounts: 'designationAccounts',
  financial_accounts: 'financialAccounts',
  expected_monthly_total: 'expectedMonthlyTotal',
  partner_giving_analysis: 'partnerGivingAnalysis',
  coaching: 'coaching',
};

export const buildReportHref: NavigationBuilder = (
  params,
  { basePath, now },
) => {
  if (!hasOnlyKeys(params, ['name', 'range'])) {
    return null;
  }
  const { name, range } = params;
  if (!isOneOf(name, REPORT_NAMES)) {
    return null;
  }
  if (range !== undefined && !isOneOf(range, RANGES)) {
    return null;
  }

  const path = `${basePath}/reports/${REPORT_SEGMENTS[name]}`;
  // Only the donations report reads a period from the URL, and only as one month
  if (
    name === 'donations' &&
    (range === 'this_month' || range === 'last_month')
  ) {
    const month = range === 'last_month' ? now.minus({ months: 1 }) : now;
    return `${path}?month=${month.startOf('month').toISODate()}`;
  }
  return path;
};
