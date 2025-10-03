import { ThemeProvider } from '@emotion/react';
import { MockLinkCallHandler } from 'graphql-ergonomock/dist/apollo/MockLink';
import { SnackbarProvider } from 'notistack';
import { DeepPartial } from 'ts-essentials';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider, gqlMock } from '__tests__/util/graphqlMocking';
import {
  GoalCalculationAge,
  MpdGoalBenefitsConstantPlanEnum,
  MpdGoalBenefitsConstantSizeEnum,
  PrimaryBudgetCategoryEnum,
  SubBudgetCategoryEnum,
} from 'src/graphql/types.generated';
import { GoalCalculatorConstantsQuery } from 'src/hooks/goalCalculatorConstants.generated';
import theme from 'src/theme';
import {
  GoalCalculationDocument,
  GoalCalculationQuery,
  GoalCalculationQueryVariables,
} from './Shared/GoalCalculation.generated';
import { GoalCalculatorProvider } from './Shared/GoalCalculatorContext';

export const goalCalculationMock = gqlMock<
  GoalCalculationQuery,
  GoalCalculationQueryVariables
>(GoalCalculationDocument, {
  variables: { accountListId: 'account-list-1', id: 'goal-calculation-1' },
  mocks: {
    goalCalculation: {
      id: 'goal-calculation-1',
      name: 'Initial Goal Name',
      firstName: 'John',
      age: GoalCalculationAge.UnderThirty,
      familySize: MpdGoalBenefitsConstantSizeEnum.MarriedNoChildren,
      benefitsPlan: MpdGoalBenefitsConstantPlanEnum.Base,
      yearsOnStaff: 5,
      netPaycheckAmount: 2500,
      spouseNetPaycheckAmount: 2000,
      taxesPercentage: 20,
      spouseTaxesPercentage: 22,
      secaExempt: false,
      spouseSecaExempt: false,
      rothContributionPercentage: 12,
      spouseRothContributionPercentage: 10,
      traditionalContributionPercentage: 5,
      spouseTraditionalContributionPercentage: 8,
      mhaAmount: 1000,
      spouseMhaAmount: 500,
      ministryFamily: {
        directInput: 5000,
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
        directInput: 5500,
        primaryBudgetCategories: [{ directInput: 5000 }],
      },
      specialFamily: {
        primaryBudgetCategories: [
          {
            id: 'category-special',
            label: 'Special Income',
            category: PrimaryBudgetCategoryEnum.SpecialIncome,
            directInput: 1000,
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
  },
}).goalCalculation;

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
  onCall?: MockLinkCallHandler;
  noMocks?: boolean;
  children?: React.ReactNode;
}

export const GoalCalculatorTestWrapper: React.FC<
  GoalCalculatorTestWrapperProps
> = ({ onCall, noMocks = false, children }) => {
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
                  goalCalculation: goalCalculationMock,
                },
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
