import { ThemeProvider } from '@emotion/react';
import { MockLinkCallHandler } from 'graphql-ergonomock/dist/apollo/MockLink';
import { SnackbarProvider } from 'notistack';
import { DeepPartial } from 'ts-essentials';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { PrimaryBudgetCategoryEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { GoalCalculationQuery } from './Shared/GoalCalculation.generated';
import { GoalCalculatorProvider } from './Shared/GoalCalculatorContext';

interface GoalCalculatorTestWrapper {
  onCall?: MockLinkCallHandler;
  children?: React.ReactNode;
}

export const goalCalculationMock = {
  goalCalculation: {
    ministryFamily: {
      primaryBudgetCategories: [
        {
          label: 'Ministry & Medical Mileage',
          category: PrimaryBudgetCategoryEnum.MinistryAndMedicalMileage,
        },
        {
          label: 'Account Transfers',
          category: PrimaryBudgetCategoryEnum.AccountTransfers,
        },
      ],
    },
  },
} satisfies DeepPartial<GoalCalculationQuery>;

export const GoalCalculatorTestWrapper: React.FC<GoalCalculatorTestWrapper> = ({
  children,
  onCall,
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter
      router={{
        query: {
          accountListId: 'account-list-1',
          goalCalculationId: 'goal-calculator-1',
        },
      }}
    >
      <SnackbarProvider>
        <GqlMockedProvider<{ 
          GoalCalculation: GoalCalculationQuery;
        }>
          mocks={{
            GoalCalculation: goalCalculationMock,
          }}
          onCall={onCall}
        >
          <GoalCalculatorProvider>{children}</GoalCalculatorProvider>
        </GqlMockedProvider>
      </SnackbarProvider>
    </TestRouter>
  </ThemeProvider>
);
