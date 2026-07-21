import React, { useMemo } from 'react';
import { DateTime } from 'luxon';
import { useExpenseCategories } from 'src/hooks/useExpenseCategories';
import { AllData, DataFields } from '../mockData';

export type TotalsType = {
  incomeTotal: number;
  expensesTotal: number;
  ministryTotal: number;
  healthcareTotal: number;
  assessmentTotal: number;
  benefitsTotal: number;
  salaryTotal: number;
  otherTotal: number;
  dataLoading: boolean;
  startDate: DateTime;
  endDate: DateTime;
};

export const TotalsContext = React.createContext<TotalsType | null>(null);

export const useTotals = (): TotalsType => {
  const context = React.useContext(TotalsContext);
  if (context === null) {
    throw new Error(
      'Could not find TotalsContext. Make sure that your component is inside <TotalsProvider>.',
    );
  }
  return context;
};

interface TotalsContextProps {
  data: AllData;
  loading?: boolean;
  startDate?: DateTime;
  endDate?: DateTime;
  children?: React.ReactNode;
}

const sum = (rows?: DataFields[]): number => {
  return rows?.reduce((acc, item) => acc + item.total, 0) || 0;
};

export const TotalsProvider: React.FC<TotalsContextProps> = ({
  children,
  data,
  loading = false,
  startDate,
  endDate,
}) => {
  const {
    ministryTotal,
    healthcareTotal,
    assessmentTotal,
    benefitsTotal,
    salaryTotal,
    otherTotal,
    expensesTotal,
  } = useExpenseCategories(data.expenses);

  const incomeTotal = useMemo(() => sum(data.income), [data.income]);

  const { reportStartDate, reportEndDate } = useMemo(() => {
    const now = DateTime.now();
    return {
      reportStartDate: startDate ?? now.minus({ months: 11 }).startOf('month'),
      reportEndDate: endDate ?? now,
    };
  }, [startDate, endDate]);

  const contextValue: TotalsType = useMemo(
    () => ({
      incomeTotal,
      expensesTotal,
      ministryTotal,
      healthcareTotal,
      assessmentTotal,
      benefitsTotal,
      salaryTotal,
      otherTotal,
      dataLoading: loading,
      startDate: reportStartDate,
      endDate: reportEndDate,
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
      loading,
      reportStartDate,
      reportEndDate,
    ],
  );

  return (
    <TotalsContext.Provider value={contextValue}>
      {children}
    </TotalsContext.Provider>
  );
};
