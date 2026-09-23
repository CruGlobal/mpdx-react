import React, { useCallback, useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useHcmQuery } from 'src/components/HrTools/Shared/HcmData/Hcm.generated';
import { useExpenseCategories } from 'src/hooks/useExpenseCategories';
import { useFilteredFunds } from 'src/hooks/useFilteredFunds';
import { useGetLastTwelveMonths } from 'src/hooks/useGetLastTwelveMonths';
import { useLocale } from 'src/hooks/useLocale';
import { monthYearFormat } from 'src/lib/intlFormat';
import { HouseholdMember } from '../../Shared/Helpers/household';
import { transformTransactionDate } from '../../Shared/Helpers/transformTransactionDate';
import { Filters } from '../../Shared/SettingsDialog/SettingsDialog';
import { DateRange } from '../../StaffExpenseReport/Helpers/StaffReportEnum';
import { FundTypes, Funds } from '../Helper/MPGAReportEnum';
import { useMpgaTransactionsQuery } from '../MPGATransactions.generated';
import { AllData, DataFields } from '../mockData';

export type ContextType = {
  currency: string;

  filters: Filters | null;
  setFilters: React.Dispatch<React.SetStateAction<Filters | null>>;
  firstFutureMonthIndex: number | undefined;
  /** Whether the month column at `index` is in the future (grayed out). */
  isFutureMonth: (index: number) => boolean;
  monthLabels: string[];

  allData: AllData;
  dataLoading: boolean;
  startDate: DateTime;
  endDate: DateTime;
  transactionYears: number[];

  /** Fund balance at the start of the queried period, or null when the report has no funds */
  startBalance: number | null;

  subtitle: string;

  /** Set when a supervisor is viewing another staff member's report */
  staffName: string | undefined;
  isSupervisorView: boolean;
  staffAccountId: string | null | undefined;

  /** Income and expenses totals */
  totals: {
    income: number;
    expenses: number;
    ministry: number;
    healthcare: number;
    assessment: number;
    benefits: number;
    salary: number;
    other: number;
  };
};

export const MPGAIncomeExpensesContext =
  React.createContext<ContextType | null>(null);

export const useMPGAIncomeExpenses = (): ContextType => {
  const context = React.useContext(MPGAIncomeExpensesContext);
  if (context === null) {
    throw new Error(
      'Could not find MPGAIncomeExpensesContext. Make sure that your component is inside <MPGAIncomeExpensesContext.Provider>.',
    );
  }
  return context;
};

interface Props {
  children?: React.ReactNode;
  staffAccountId?: string | null;
  /** The HCM person whose household to load when a supervisor views someone else's report. */
  personNumber?: string;
}

const sum = (rows?: DataFields[]): number => {
  return rows?.reduce((acc, item) => acc + item.total, 0) || 0;
};

export const MPGAIncomeExpensesReportProvider: React.FC<Props> = ({
  children,
  staffAccountId,
  personNumber,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const currency = 'USD';

  const isSupervisorView = Boolean(staffAccountId);

  // Person numbers tell the reader's payroll from their spouse's. HCM lists the reader first, then
  // their spouse. Both requests leave together; `loading` below covers them both so salary is not
  // rendered as one household total and then split.
  const { data: hcmData, loading: hcmLoading } = useHcmQuery({
    variables: { personNumber },
    skip: isSupervisorView && !personNumber,
  });
  const household: HouseholdMember[] = useMemo(
    () =>
      hcmData?.hcm.map(({ staffInfo }) => ({
        personNumber: staffInfo.personNumber,
        name: staffInfo.preferredName ?? staffInfo.lastName,
      })) ?? [],
    [hcmData],
  );

  const [filters, setFilters] = useState<Filters | null>(null);

  const now = useMemo(() => DateTime.now(), []);

  const selectedYear = filters?.selectedYear ?? null;
  const isYearToDate =
    selectedYear === null &&
    filters?.selectedDateRange === DateRange.YearToDate;

  const effectiveYear = selectedYear ?? (isYearToDate ? now.year : null);

  // If year to date filter is selected, get first month index in the future to gray out future months in the table
  const firstFutureMonthIndex = isYearToDate ? now.month : undefined;

  const isFutureMonth = useCallback(
    (index: number) =>
      firstFutureMonthIndex !== undefined && index >= firstFutureMonthIndex,
    [firstFutureMonthIndex],
  );

  const { startDate, endDate } = useMemo(() => {
    // If a year filter is selected, show the full year
    if (effectiveYear !== null) {
      const yearStart = DateTime.fromObject({ year: effectiveYear }).startOf(
        'year',
      );
      const yearEnd = yearStart.endOf('year');
      return { startDate: yearStart, endDate: yearEnd < now ? yearEnd : now };
    }
    // If no year is selected, default to the last 12 months
    return {
      startDate: now.minus({ months: 11 }).startOf('month'),
      endDate: now,
    };
  }, [effectiveYear, now]);

  const monthLabels = useGetLastTwelveMonths(locale, now, effectiveYear);

  const subtitle = useMemo(() => {
    if (selectedYear === null && !isYearToDate) {
      return t('Last 12 Months');
    }
    return t('{{startMonth}} – {{endMonth}}', {
      startMonth: monthYearFormat(
        startDate.month,
        startDate.year,
        locale,
        true,
        true,
      ),
      endMonth: monthYearFormat(
        endDate.month,
        endDate.year,
        locale,
        true,
        true,
      ),
    });
  }, [selectedYear, isYearToDate, startDate, endDate, locale, t]);

  const { data: reportData, loading: reportLoading } = useMpgaTransactionsQuery(
    {
      variables: {
        fundTypes: [FundTypes.Primary],
        startMonth: startDate.toISODate(),
        endMonth: endDate.toISODate(),
        staffAccountId,
      },
    },
  );
  const loading = reportLoading || hcmLoading;

  const staffName = reportData?.reportsStaffExpenses?.name;

  // Filter out the current year since we only want to show previous years in filter dropdown
  const transactionYears = useMemo(
    () =>
      (reportData?.reportsStaffExpenses?.transactionYears ?? []).filter(
        (year) => year < now.year,
      ),
    [reportData, now.year],
  );

  const funds = reportData?.reportsStaffExpenses?.funds;
  const startBalance = funds?.length
    ? funds.reduce((acc, fund) => acc + fund.startBalance, 0)
    : null;

  // Transform the data to ensure that all optional fields are defined, so we don't have to check for them later
  const transformedData: Funds[] = useMemo(
    () =>
      (reportData?.reportsStaffExpenses?.funds ?? []).map((fund) => ({
        ...fund,
        categories: (fund.categories ?? []).map((category) => ({
          ...category,
          subcategories: (category.subcategories ?? []).map((subcategory) => ({
            ...subcategory,
            breakdownByMonth: subcategory.breakdownByMonth.map((month) => ({
              ...month,
              transactions: (month.transactions ?? []).map((transaction) => ({
                transactedAt: transformTransactionDate(
                  transaction.transactedAt,
                ),
                description: transaction.description ?? '',
                amount: transaction.amount,
                personNumber: transaction.personNumber,
              })),
            })),
          })),
        })),
      })),
    [reportData],
  );

  const { incomeData, expenseData } = useFilteredFunds(
    transformedData,
    filters?.categories ?? null,
    t,
    household,
  );

  const allData: AllData = useMemo(() => {
    if (!isYearToDate) {
      return {
        income: incomeData,
        expenses: expenseData,
      };
    }

    // Year to Date only has data through the current month, so fill the
    // remaining (future) months with 0.
    const addFutureData = (rows: DataFields[]): DataFields[] =>
      rows.map((row) => ({
        ...row,
        monthly: monthLabels.map((_month, index) =>
          isFutureMonth(index) ? 0 : (row.monthly?.[index] ?? 0),
        ),
      }));

    return {
      income: addFutureData(incomeData),
      expenses: addFutureData(expenseData),
    };
  }, [incomeData, expenseData, isYearToDate, monthLabels, isFutureMonth]);

  const {
    ministryTotal,
    healthcareTotal,
    assessmentTotal,
    benefitsTotal,
    salaryTotal,
    otherTotal,
    expensesTotal,
  } = useExpenseCategories(allData.expenses);

  const incomeTotal = useMemo(() => sum(allData.income), [allData.income]);

  const totals = useMemo(
    () => ({
      income: incomeTotal,
      expenses: expensesTotal,
      ministry: ministryTotal,
      healthcare: healthcareTotal,
      assessment: assessmentTotal,
      benefits: benefitsTotal,
      salary: salaryTotal,
      other: otherTotal,
    }),
    [
      incomeTotal,
      expensesTotal,
      ministryTotal,
      healthcareTotal,
      assessmentTotal,
      benefitsTotal,
      salaryTotal,
      otherTotal,
    ],
  );

  const contextValue: ContextType = useMemo(
    () => ({
      currency,
      filters,
      setFilters,
      firstFutureMonthIndex,
      monthLabels,
      isFutureMonth,
      allData,
      dataLoading: loading,
      startDate,
      endDate,
      transactionYears,
      startBalance,
      subtitle,
      staffName,
      isSupervisorView,
      staffAccountId,
      totals,
    }),
    [
      currency,
      filters,
      setFilters,
      firstFutureMonthIndex,
      monthLabels,
      isFutureMonth,
      allData,
      loading,
      startDate,
      endDate,
      transactionYears,
      startBalance,
      subtitle,
      staffName,
      isSupervisorView,
      staffAccountId,
      totals,
    ],
  );

  return (
    <MPGAIncomeExpensesContext.Provider value={contextValue}>
      {children}
    </MPGAIncomeExpensesContext.Provider>
  );
};
