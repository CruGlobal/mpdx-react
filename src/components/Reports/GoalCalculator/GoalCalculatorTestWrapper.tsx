import { ThemeProvider } from '@emotion/react';
import { MockLinkCallHandler } from 'graphql-ergonomock/dist/apollo/MockLink';
import { SnackbarProvider } from 'notistack';
import { DeepPartial } from 'ts-essentials';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  GoalCalculationAge,
  MpdGoalBenefitsConstantPlanEnum,
  MpdGoalBenefitsConstantSizeEnum,
  PrimaryBudgetCategoryEnum,
  SubBudgetCategoryEnum,
} from 'src/graphql/types.generated';
import { GoalCalculatorConstantsQuery } from 'src/hooks/goalCalculatorConstants.generated';
import theme from 'src/theme';
import { GoalCalculationQuery } from './Shared/GoalCalculation.generated';
import { GoalCalculatorProvider } from './Shared/GoalCalculatorContext';

export const goalCalculationMock = {
  goalCalculation: {
    id: 'goal-calculation-1',
    name: 'Initial Goal Name',
    firstName: 'John',
    familySize: MpdGoalBenefitsConstantSizeEnum.MarriedNoChildren,
    benefitsPlan: MpdGoalBenefitsConstantPlanEnum.Base,
    age: GoalCalculationAge.UnderThirty,
    yearsOnStaff: 5,
    secaExempt: false,
    spouseSecaExempt: false,
    mhaAmount: 1000,
    spouseMhaAmount: 500,
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

export const constantsMock = {
  constant: {
    mpdGoalBenefitsConstants: [
      {
        size: MpdGoalBenefitsConstantSizeEnum.Single,
        sizeDisplayName: 'Single or spouse not staff',
        plan: MpdGoalBenefitsConstantPlanEnum.Select,
        planDisplayName: 'Select',
      },
      {
        size: MpdGoalBenefitsConstantSizeEnum.MarriedNoChildren,
        sizeDisplayName: 'Married with no children',
        plan: MpdGoalBenefitsConstantPlanEnum.Base,
        planDisplayName: 'Base',
      },
    ],
  },
} satisfies DeepPartial<GoalCalculatorConstantsQuery>;

interface GoalCalculatorTestWrapperProps {
  householdDirectInput?: number | null;
  onCall?: MockLinkCallHandler;
  noMocks?: boolean;
  children?: React.ReactNode;
}

export const GoalCalculatorTestWrapper: React.FC<
  GoalCalculatorTestWrapperProps
> = ({ householdDirectInput = null, onCall, noMocks = false, children }) => {
  const content = <GoalCalculatorProvider>{children}</GoalCalculatorProvider>;
  return (
    <ThemeProvider theme={theme}>
      <TestRouter
        router={{
          query: {
            accountListId: 'account-list-1',
            goalCalculationId: 'goal-calculation-1',
          },
        }}
      >
        <SnackbarProvider>
          {noMocks ? (
            content
          ) : (
            <GqlMockedProvider<{
              GoalCalculation: GoalCalculationQuery;
              GoalCalculatorConstants: GoalCalculatorConstantsQuery;
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
                GoalCalculatorConstants: constantsMock,
              }}
              onCall={onCall}
            >
              {content}
            </GqlMockedProvider>
          )}
        </SnackbarProvider>
      </TestRouter>
    </ThemeProvider>
  );
};
