import React, { useCallback, useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useExpenseCategories } from 'src/hooks/useExpenseCategories';
import { useFilteredFunds } from 'src/hooks/useFilteredFunds';
import { useGetLastTwelveMonths } from 'src/hooks/useGetLastTwelveMonths';
import { useLocale } from 'src/hooks/useLocale';
import { monthYearFormat } from 'src/lib/intlFormat';
import { Filters } from '../../Shared/SettingsDialog/SettingsDialog';
import { DateRange } from '../../StaffExpenseReport/Helpers/StaffReportEnum';
import { FundTypes, Funds } from '../Helper/MPGAReportEnum';
import { useMpgaTransactionsQuery } from '../MPGATransactions.generated';
import { AllData, DataFields } from '../mockData';

export type ReportContextType = {
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

  subtitle: string;

  /** Income and expenses totals */
  incomeTotal: number;
  expensesTotal: number;
  ministryTotal: number;
  healthcareTotal: number;
  assessmentTotal: number;
  benefitsTotal: number;
  salaryTotal: number;
  otherTotal: number;
};

export const ReportContext = React.createContext<ReportContextType | null>(
  null,
);

export const useReport = (): ReportContextType => {
  const context = React.useContext(ReportContext);
  if (context === null) {
    throw new Error(
      'Could not find ReportContext. Make sure that your component is inside <ReportProvider>.',
    );
  }
  return context;
};

interface ReportContextProps {
  children?: React.ReactNode;
}

const sum = (rows?: DataFields[]): number => {
  return rows?.reduce((acc, item) => acc + item.total, 0) || 0;
};

export const ReportProvider: React.FC<ReportContextProps> = ({ children }) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const currency = 'USD';

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

  const monthLabels = useGetLastTwelveMonths(locale, effectiveYear);

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

  const { data: reportData, loading } = useMpgaTransactionsQuery({
    variables: {
      fundTypes: [FundTypes.Primary],
      startMonth: startDate.toISODate(),
      endMonth: endDate.toISODate(),
    },
  });

  const transformedData: Funds[] = useMemo(
    () =>
      (reportData?.reportsStaffExpenses?.funds ?? []).map((fund) => ({
        ...fund,
        categories: (fund.categories ?? []).map((category) => ({
          ...category,
          category: category.category,
          breakdownByMonth: category.breakdownByMonth.map((month) => ({
            ...month,
          })),
          subcategories: (category.subcategories ?? []).map((subcategory) => ({
            ...subcategory,
            subCategory: subcategory.subCategory,
            breakdownByMonth: subcategory.breakdownByMonth.map((month) => ({
              ...month,
              transactions: (month.transactions ?? []).map((transaction) => ({
                transactedAt: transaction.transactedAt,
                description: transaction.description ?? '',
                amount: transaction.amount,
              })),
            })),
          })),
        })),
      })),
    [reportData],
  );

  const { incomeData, expenseData, incomeBreakdown, expenseBreakdown } =
    useFilteredFunds(transformedData, filters?.categories ?? null, t);

  const allData: AllData = useMemo(() => {
    if (!isYearToDate) {
      return {
        income: incomeData,
        expenses: expenseData,
        incomeBreakdown,
        expenseBreakdown,
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
      incomeBreakdown,
      expenseBreakdown,
    };
  }, [
    incomeData,
    expenseData,
    incomeBreakdown,
    expenseBreakdown,
    isYearToDate,
    monthLabels,
    isFutureMonth,
  ]);

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

  const contextValue: ReportContextType = useMemo(
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
      subtitle,
      incomeTotal,
      expensesTotal,
      ministryTotal,
      healthcareTotal,
      assessmentTotal,
      benefitsTotal,
      salaryTotal,
      otherTotal,
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
      subtitle,
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

  return (
    <ReportContext.Provider value={contextValue}>
      {children}
    </ReportContext.Provider>
  );
};
