import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MockLinkCallHandler } from 'graphql-ergonomock/dist/apollo/MockLink';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { StaffExpenseCategoryEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { FundTypes } from './Helper/MPGAReportEnum';
import { MpgaTransactionsQuery } from './MPGATransactions.generated';
import { ReportProvider } from './ReportContext/ReportContext';

const toBreakdown = (values: number[]): { month: string; total: number }[] =>
  values.map((total, index) => ({
    month: `2019-${String(index + 1).padStart(2, '0')}-01`,
    total,
  }));

export const mpgaTransactionsMock: MpgaTransactionsQuery = {
  reportsStaffExpenses: {
    funds: [
      {
        fundType: FundTypes.Primary,
        total: 108856,
        categories: [
          {
            category: StaffExpenseCategoryEnum.Donation,
            averagePerMonth: 9013,
            total: 108856,
            breakdownByMonth: toBreakdown([
              6770, 6090, 5770, 7355, 8035, 6575, 7556, 8239, 9799, 9729, 13020,
              19215,
            ]),
            subcategories: [],
          },
          {
            category: StaffExpenseCategoryEnum.Transfer,
            averagePerMonth: -17,
            total: -200,
            breakdownByMonth: toBreakdown([
              0, 0, -200, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            ]),
            subcategories: [],
          },
          {
            category: StaffExpenseCategoryEnum.MinistryReimbursement,
            averagePerMonth: -177,
            total: -2124,
            breakdownByMonth: toBreakdown([
              0, 0, 0, 0, 0, 0, -565, 0, -488, -253, -818, 0,
            ]),
            subcategories: [],
          },
          {
            category: StaffExpenseCategoryEnum.HealthcareReimbursement,
            averagePerMonth: -161,
            total: -1933,
            breakdownByMonth: toBreakdown([
              0, 0, 0, -976, -55, 0, 0, 0, -194, -708, 0, 0,
            ]),
            subcategories: [],
          },
          {
            category: StaffExpenseCategoryEnum.Benefits,
            averagePerMonth: -200,
            total: -2400,
            breakdownByMonth: toBreakdown([
              -200, -200, -200, -200, -200, -200, -200, -200, -200, -200, -200,
              -200,
            ]),
            subcategories: [],
          },
          {
            category: StaffExpenseCategoryEnum.Salary,
            averagePerMonth: -2,
            total: -26,
            breakdownByMonth: toBreakdown([
              -26, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            ]),
            subcategories: [],
          },
          {
            category: StaffExpenseCategoryEnum.Other,
            averagePerMonth: -42,
            total: -507,
            breakdownByMonth: toBreakdown([
              -23, -23, -23, -45, -22, -22, -28, -24, -28, -29, -186, -55,
            ]),
            subcategories: [],
          },
          {
            category: StaffExpenseCategoryEnum.Assessment,
            averagePerMonth: -1148,
            total: -13779,
            breakdownByMonth: toBreakdown([
              -812, -731, -692, -883, -964, -789, -907, -989, -1176, -1227,
              -2237, -2372,
            ]),
            subcategories: [],
          },
        ],
      },
    ],
  },
};

interface MPGAIncomeExpensesReportTestWrapperProps {
  onCall?: MockLinkCallHandler;
  isEmpty?: boolean;
  mocks?: MpgaTransactionsQuery;
  children?: React.ReactNode;
}

export const MPGAIncomeExpensesReportTestWrapper: React.FC<
  MPGAIncomeExpensesReportTestWrapperProps
> = ({ onCall, isEmpty, mocks, children }) => {
  const mpgaTransactions =
    mocks ??
    (isEmpty ? { reportsStaffExpenses: { funds: [] } } : mpgaTransactionsMock);

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <GqlMockedProvider<{ MPGATransactions: MpgaTransactionsQuery }>
          mocks={{ MPGATransactions: mpgaTransactions }}
          onCall={onCall}
        >
          <ReportProvider>{children}</ReportProvider>
        </GqlMockedProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
};
