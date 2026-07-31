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
      readOnly: false,
      // Jest pins the current date to 2020-01-01, so the calculation year
      // options are 2020, 2019, and 2018
      createdAt: '2018-06-15T12:00:00-05:00',
      calculationsYear: 2019,
      firstName: 'John',
      spouseFirstName: 'Jane',
      lastName: 'Doe',
      geographicLocation: null,
      role: GoalCalculationRole.Office,
      ministryLocation: 'University of Central Florida',
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
            label: 'Outside Income',
            category: PrimaryBudgetCategoryEnum.OutsideIncome,
            directInput: 1000,
            subBudgetCategories: [],
          },
          {
            id: 'category-goal',
            label: 'Special Needs Goal',
            category: PrimaryBudgetCategoryEnum.SpecialNeedsGoal,
            directInput: 0,
            subBudgetCategories: [],
          },
        ],
      },
      newStaffCalculations: {
        salary: 5211,
        secaRate: 0.22,
        seca: 1146,
        salarySubtotal: 6357,
        contribution403bPercentage: 0.07,
        totalContributing403bAmount: 479,
        totalSalary: 6836,
        ministryMiles: 98,
        travel: 60,
        conferences: 100,
        meals: 60,
        mpd: 124.5,
        supplies: 50,
        benefitsCharge: 1910.54,
        medicalExpenses: 330,
        adminRate: 0.12,
        attritionRate: 0.06,
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
        {
          category: MpdGoalMiscConstantCategoryEnum.ReimbursementsWithMaximum,
          label: MpdGoalMiscConstantLabelEnum.Phone,
          fee: 75,
        },
        {
          category: MpdGoalMiscConstantCategoryEnum.ReimbursementsWithMaximum,
          label: MpdGoalMiscConstantLabelEnum.Internet,
          fee: 50,
        },
      ],
    },
  },
}).constant;

const emptyConstants: GoalCalculatorConstantsQuery['constant'] = {
  mpdGoalBenefitsConstants: [],
  mpdGoalGeographicConstants: [],
  mpdGoalMiscConstants: [],
};

/**
 * Build a `GoalCalculatorConstants` mock whose constant lists resolve based on
 * the query's `year` argument. graphql-ergonomock calls function mock values
 * as field resolvers with `(root, args, context, info)`, so each list looks up
 * the constants for the requested year. Years without an entry (including a
 * null year) resolve to empty constant lists.
 *
 * The return value is cast because `GqlMockedProvider`'s `mocks` prop is typed
 * as the query data shape, but graphql-ergonomock also accepts resolver
 * functions in place of field values.
 */
const mockConstantsByYear = (
  constantsByYear: Record<number, GoalCalculatorConstantsQuery['constant']>,
): GoalCalculatorConstantsQuery['constant'] => {
  const constantsForYear = (args: {
    year?: number | null;
  }): GoalCalculatorConstantsQuery['constant'] =>
    (typeof args.year === 'number' ? constantsByYear[args.year] : undefined) ??
    emptyConstants;

  return {
    mpdGoalBenefitsConstants: (
      _root: unknown,
      args: { year?: number | null },
    ) => constantsForYear(args).mpdGoalBenefitsConstants,
    mpdGoalGeographicConstants: (
      _root: unknown,
      args: { year?: number | null },
    ) => constantsForYear(args).mpdGoalGeographicConstants,
    mpdGoalMiscConstants: (_root: unknown, args: { year?: number | null }) =>
      constantsForYear(args).mpdGoalMiscConstants,
  } as unknown as GoalCalculatorConstantsQuery['constant'];
};

interface MockedGoalCalculatorTestWrapperProps {
  noMocks?: false;
  onCall?: MockLinkCallHandler;
  readOnly?: boolean;
  /** Override the mocked goal calculation (defaults to `goalCalculationMock`). */
  goalCalculation?: GoalCalculationQuery['goalCalculation'];
  /**
   * Mock the `GoalCalculatorConstants` query per-year instead of statically.
   * The constant lists resolve from the entry matching the query's `year`
   * argument; years without an entry resolve to empty constant lists. Omit to
   * mock every year with the static `constantsMock`.
   */
  constantsByYear?: Record<number, GoalCalculatorConstantsQuery['constant']>;
  children?: React.ReactNode;
}

interface NoMocksGoalCalculatorTestWrapperProps {
  /**
   * Skip the `GqlMockedProvider` entirely (the test supplies its own Apollo
   * provider). `onCall`, `readOnly`, `goalCalculation`, and `constantsByYear`
   * only configure the mocked provider, so they are disallowed here — they
   * would silently no-op.
   */
  noMocks: true;
  onCall?: never;
  readOnly?: never;
  goalCalculation?: never;
  constantsByYear?: never;
  children?: React.ReactNode;
}

type GoalCalculatorTestWrapperProps =
  | MockedGoalCalculatorTestWrapperProps
  | NoMocksGoalCalculatorTestWrapperProps;

export const GoalCalculatorTestWrapper: React.FC<
  GoalCalculatorTestWrapperProps
> = ({
  onCall,
  noMocks = false,
  readOnly = false,
  goalCalculation = goalCalculationMock,
  constantsByYear,
  children,
}) => {
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
                  goalCalculation: readOnly
                    ? { ...goalCalculation, readOnly: true }
                    : goalCalculation,
                },
                GoalCalculatorConstants: {
                  constant: constantsByYear
                    ? mockConstantsByYear(constantsByYear)
                    : constantsMock,
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
