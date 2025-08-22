import React, { useMemo } from 'react';
import { AllData, DataFields } from '../mockData';

export type TotalsType = {
  incomeTotal: number;
  expensesTotal: number;
  ministryTotal: number;
  healthcareTotal: number;
  miscTotal: number;
  otherTotal: number;
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
  children?: React.ReactNode;
}

const sum = (rows?: DataFields[]): number => {
  return rows?.reduce((acc, item) => acc + item.total, 0) || 0;
};

export const TotalsProvider: React.FC<TotalsContextProps> = ({
  children,
  data,
}) => {
  const incomeTotal = useMemo(() => {
    return sum(data.income);
  }, [data.income]);

  // const ministryTotal = useMemo(() => {
  //   return sum(data.ministryExpenses);
  // }, [data.ministryExpenses]);

  // const healthcareTotal = useMemo(() => {
  //   return sum(data.healthcareExpenses);
  // }, [data.healthcareExpenses]);

  // const miscTotal = useMemo(() => {
  //   return sum(data.misc);
  // }, [data.misc]);

  // const otherTotal = useMemo(() => {
  //   return sum(data.other);
  // }, [data.other]);

  // const expensesTotal = useMemo(
  //   () => ministryTotal + healthcareTotal + miscTotal + otherTotal,
  //   [ministryTotal, healthcareTotal, miscTotal, otherTotal],
  // );

  // Remove Later
  const ministryTotal = 2_456.78;
  const healthcareTotal = 1_799.26;
  const miscTotal = 1_732.11;
  const otherTotal = 980.25;

  const expensesTotal = useMemo(() => {
    return sum(data.expenses);
  }, [data.expenses]);

  const contextValue: TotalsType = useMemo(
    () => ({
      incomeTotal,
      expensesTotal,
      ministryTotal,
      healthcareTotal,
      miscTotal,
      otherTotal,
    }),
    [
      incomeTotal,
      expensesTotal,
      ministryTotal,
      healthcareTotal,
      miscTotal,
      otherTotal,
    ],
  );

  return (
    <TotalsContext.Provider value={contextValue}>
      {children}
    </TotalsContext.Provider>
  );
};
