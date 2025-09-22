import { ThemeProvider } from '@emotion/react';
import { MockLinkCallHandler } from 'graphql-ergonomock/dist/apollo/MockLink';
import { SnackbarProvider } from 'notistack';
import { DeepPartial } from 'ts-essentials';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  PrimaryBudgetCategoryEnum,
  SubBudgetCategoryEnum,
} from 'src/graphql/types.generated';
import theme from 'src/theme';
import { GoalCalculationQuery } from './Shared/GoalCalculation.generated';
import { GoalCalculatorProvider } from './Shared/GoalCalculatorContext';

interface GoalCalculatorTestWrapper {
  householdDirectInput?: number | null;
  onCall?: MockLinkCallHandler;
  children?: React.ReactNode;
}

export const goalCalculationMock = {
  goalCalculation: {
    id: 'test-goal-id',
    name: 'Initial Goal Name',
    mhaAmount: 1000,
    ministryFamily: {
      primaryBudgetCategories: [
        {
          id: 'category-ministry',
          label: 'Ministry & Medical Mileage',
          category: PrimaryBudgetCategoryEnum.MinistryAndMedicalMileage,
          directInput: null,
          subBudgetCategories: [
            {
              id: 'compass-room',
              label: 'Compass Room',
              amount: 450,
              category: SubBudgetCategoryEnum.PersonalMisc,
            },
            {
              id: 'other-ministry',
              label: 'Other Ministry',
              amount: 1000,
              category: null,
            },
          ],
        },
        {
          id: 'category-transfers',
          label: 'Account Transfers',
          category: PrimaryBudgetCategoryEnum.AccountTransfers,
          directInput: 0,
          subBudgetCategories: [],
        },
        {
          id: 'category-1',
          label: 'Internet & Mobile',
          category: PrimaryBudgetCategoryEnum.Utilities,
          directInput: null, // null means Line Item mode, which shows subcategories
          subBudgetCategories: [
            {
              id: 'sub-1',
              label: 'Internet',
              amount: 60,
              category: SubBudgetCategoryEnum.UtilitiesInternet,
            },
            {
              id: 'sub-2',
              label: 'Phone/Mobile',
              amount: 40,
              category: SubBudgetCategoryEnum.UtilitiesPhoneMobile,
            },
          ],
        },
      ],
    },
    householdFamily: {
      id: 'household-family',
    },
    specialFamily: {
      primaryBudgetCategories: [
        {
          id: 'category-special',
          label: 'Special Income',
          category: PrimaryBudgetCategoryEnum.SpecialIncome,
          directInput: 0,
          subBudgetCategories: [],
        },
        {
          id: 'category-goal',
          label: 'One Time Goal',
          category: PrimaryBudgetCategoryEnum.OneTimeGoal,
          directInput: 0,
          subBudgetCategories: [],
        },
      ],
    },
  },
} satisfies DeepPartial<GoalCalculationQuery>;

export const GoalCalculatorTestWrapper: React.FC<GoalCalculatorTestWrapper> = ({
  householdDirectInput = null,
  onCall,
  children,
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
            GoalCalculation: {
              ...goalCalculationMock,
              goalCalculation: {
                ...goalCalculationMock.goalCalculation,
                householdFamily: {
                  ...goalCalculationMock.goalCalculation.householdFamily,
                  directInput: householdDirectInput,
                },
              },
            },
          }}
          onCall={onCall}
        >
          <GoalCalculatorProvider>{children}</GoalCalculatorProvider>
        </GqlMockedProvider>
      </SnackbarProvider>
    </TestRouter>
  </ThemeProvider>
);
