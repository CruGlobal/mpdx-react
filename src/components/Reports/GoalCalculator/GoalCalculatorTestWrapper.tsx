import { ThemeProvider } from '@emotion/react';
import { MockLinkCallHandler } from 'graphql-ergonomock/dist/apollo/MockLink';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider, gqlMock } from '__tests__/util/graphqlMocking';
import {
  GoalCalculationAge,
  GoalCalculationRole,
  MpdGoalBenefitsConstantPlanEnum,
  MpdGoalBenefitsConstantSizeEnum,
  MpdGoalMiscConstantCategoryEnum,
  MpdGoalMiscConstantLabelEnum,
  PrimaryBudgetCategoryEnum,
  SubBudgetCategoryEnum,
} from 'src/graphql/types.generated';
import {
  GoalCalculatorConstantsDocument,
  GoalCalculatorConstantsQuery,
} from 'src/hooks/goalCalculatorConstants.generated';
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
      spouseFirstName: 'Jane',
      lastName: 'Doe',
      geographicLocation: null,
      role: GoalCalculationRole.Office,
      familySize: MpdGoalBenefitsConstantSizeEnum.MarriedNoChildren,
      benefitsPlan: MpdGoalBenefitsConstantPlanEnum.Base,
      yearsOnStaff: 10,
      spouseYearsOnStaff: 5,
      age: GoalCalculationAge.ThirtyToThirtyFour,
      spouseAge: GoalCalculationAge.UnderThirty,
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

export const constantsMock = gqlMock<
  GoalCalculatorConstantsQuery,
  GoalCalculatorConstantsQuery
>(GoalCalculatorConstantsDocument, {
  mocks: {
    constant: {
      mpdGoalBenefitsConstants: [
        {
          size: MpdGoalBenefitsConstantSizeEnum.Single,
          sizeDisplayName: 'Single or spouse not staff',
          plan: MpdGoalBenefitsConstantPlanEnum.Select,
          planDisplayName: 'Select',
          cost: 1204.45,
        },
        {
          size: MpdGoalBenefitsConstantSizeEnum.Single,
          sizeDisplayName: 'Single or spouse not staff',
          plan: MpdGoalBenefitsConstantPlanEnum.Base,
          planDisplayName: 'Base',
          cost: 1008.6,
        },
        {
          size: MpdGoalBenefitsConstantSizeEnum.SosaTwoToThreeDependents,
          sizeDisplayName: 'SOSA with 2-3 dependents',
          plan: MpdGoalBenefitsConstantPlanEnum.Base,
          planDisplayName: 'Base',
          cost: 2350.64,
        },
        {
          size: MpdGoalBenefitsConstantSizeEnum.MarriedNoChildren,
          sizeDisplayName: 'Married with no children',
          plan: MpdGoalBenefitsConstantPlanEnum.Base,
          planDisplayName: 'Base',
          cost: 1910.54,
        },
        {
          size: MpdGoalBenefitsConstantSizeEnum.MarriedOneToTwoChildren,
          sizeDisplayName: 'Married with 1-2 children',
          plan: MpdGoalBenefitsConstantPlanEnum.Select,
          planDisplayName: 'Select',
          cost: 3219.27,
        },
        {
          size: MpdGoalBenefitsConstantSizeEnum.MarriedThreeOrMoreChildren,
          sizeDisplayName: 'Married with 3+ children',
          plan: MpdGoalBenefitsConstantPlanEnum.Base,
          planDisplayName: 'Base',
          cost: 3286.5,
        },
      ],
      mpdGoalGeographicConstants: [
        { location: 'Orlando, FL', percentageMultiplier: 0.06 },
      ],
      mpdGoalMiscConstants: [
        {
          category: MpdGoalMiscConstantCategoryEnum.Rates,
          label: MpdGoalMiscConstantLabelEnum.AdminRate,
          fee: 0.12,
        },
        {
          category: MpdGoalMiscConstantCategoryEnum.Rates,
          label: MpdGoalMiscConstantLabelEnum.AttritionRate,
          fee: 0.06,
        },
        {
          category: MpdGoalMiscConstantCategoryEnum.Rates,
          label: MpdGoalMiscConstantLabelEnum.Seca,
          fee: 0.22,
        },
        {
          category: MpdGoalMiscConstantCategoryEnum.Rates,
          label: MpdGoalMiscConstantLabelEnum.FourOhThreeB,
          fee: 0.07,
        },
        {
          category: MpdGoalMiscConstantCategoryEnum.MileageRates,
          label: MpdGoalMiscConstantLabelEnum.General,
          fee: 0.7,
        },
        {
          category: MpdGoalMiscConstantCategoryEnum.DebtPercentage,
          label: MpdGoalMiscConstantLabelEnum.Single,
          fee: 0.24,
        },
        {
          category: MpdGoalMiscConstantCategoryEnum.DebtPercentage,
          label: MpdGoalMiscConstantLabelEnum.Married,
          fee: 0.2,
        },
        {
          category: MpdGoalMiscConstantCategoryEnum.BoardApprovedSalaryCalc,
          label: MpdGoalMiscConstantLabelEnum.SingleOther,
          fee: 80000,
        },
        {
          category: MpdGoalMiscConstantCategoryEnum.BoardApprovedSalaryCalc,
          label: MpdGoalMiscConstantLabelEnum.MarriedOther,
          fee: 125000,
        },
        {
          category: MpdGoalMiscConstantCategoryEnum.BoardApprovedSalaryCalc,
          label: MpdGoalMiscConstantLabelEnum.SingleNy,
          fee: 90000,
        },
        {
          category: MpdGoalMiscConstantCategoryEnum.BoardApprovedSalaryCalc,
          label: MpdGoalMiscConstantLabelEnum.MarriedNy,
          fee: 140000,
        },
      ],
    },
  },
}).constant;

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
                GoalCalculatorConstants: {
                  constant: constantsMock,
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
