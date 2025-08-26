import { ReactElement } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { MinistryExpenses } from '../useReportExpenses';
import { AccountListSupportRaisedQuery } from './MpdGoalTable.generated';
import { useGoalLineItems } from './useGoalLineItems';

const mockGoal = {
  netMonthlySalary: 6000,
  taxesPercentage: 0.2,
  rothContributionPercentage: 0.1,
  traditionalContributionPercentage: 0.04,
  ministryExpenses: {
    benefitsCharge: 0,
    primaryCategories: [],
  } as MinistryExpenses,
  ministryExpensesTotal: 3800,
};

const Wrapper: React.FC<{ children: ReactElement }> = ({ children }) => (
  <TestRouter
    router={{
      query: { accountListId: 'account-list-1' },
    }}
  >
    <GqlMockedProvider<{
      AccountListSupportRaised: AccountListSupportRaisedQuery;
    }>
      mocks={{
        AccountListSupportRaised: {
          accountList: {
            receivedPledges: 8745,
          },
        },
      }}
    >
      {children}
    </GqlMockedProvider>
  </TestRouter>
);

describe('useGoalLineItems', () => {
  it('should calculate goal line items correctly', async () => {
    const { result } = renderHook(() => useGoalLineItems(mockGoal), {
      wrapper: Wrapper,
    });

    await waitFor(() =>
      expect(result.current).toEqual({
        taxes: 1200,
        salaryPreIra: 7200,
        rothContribution: 800,
        traditionalContribution: 300,
        grossAnnualSalary: 99600,
        grossMonthlySalary: 8300,
        ministryExpensesTotal: 3800,
        overallSubtotal: 12100,
        overallSubtotalWithAdmin: 13750,
        overallTotal: 14575,
        supportRaised: 8745,
        supportRemaining: 5830,
        supportRaisedPercentage: 0.6,
      }),
    );
  });
});
