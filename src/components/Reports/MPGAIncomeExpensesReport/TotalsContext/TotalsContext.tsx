import React, { useMemo } from 'react';
import { useExpenseCategories } from 'src/hooks/useExpenseCategories';
import { AllData, DataFields } from '../mockData';

export type TotalsType = {
  incomeTotal: number;
  expensesTotal: number;
  ministryTotal: number;
  healthcareTotal: number;
  assessmentTotal: number;
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
  const { ministry, healthcare, assessment, other } = useExpenseCategories(
    data.expenses,
  );

  const incomeTotal = sum(data.income);

  const ministryTotal = sum(ministry);

  const healthcareTotal = sum(healthcare);

  const assessmentTotal = sum(assessment);

  const otherTotal = sum(other);

  const expensesTotal = useMemo(
    () => ministryTotal + healthcareTotal + assessmentTotal + otherTotal,
    [ministryTotal, healthcareTotal, assessmentTotal, otherTotal],
  );

  const contextValue: TotalsType = useMemo(
    () => ({
      incomeTotal,
      expensesTotal,
      ministryTotal,
      healthcareTotal,
      assessmentTotal,
      otherTotal,
    }),
    [
      incomeTotal,
      expensesTotal,
      ministryTotal,
      healthcareTotal,
      assessmentTotal,
      otherTotal,
    ],
  );

  return (
    <TotalsContext.Provider value={contextValue}>
      {children}
    </TotalsContext.Provider>
  );
};
