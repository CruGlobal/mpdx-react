import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { MockLinkCallHandler } from 'graphql-ergonomock/dist/apollo/MockLink';
import { merge, mergeWith } from 'lodash';
import { SnackbarProvider } from 'notistack';
import { DeepPartial } from 'ts-essentials';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider, gqlMock } from '__tests__/util/graphqlMocking';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import {
  DesignationSupportFormType,
  DesignationSupportSalaryType,
  DesignationSupportStatus,
  MpdGoalMiscConstantCategoryEnum,
  MpdGoalMiscConstantLabelEnum,
} from 'src/graphql/types.generated';
import { GoalCalculatorConstantsQuery } from 'src/hooks/goalCalculatorConstants.generated';
import theme from 'src/theme';
import { AccountListSupportRaisedQuery } from '../GoalCalculator/Shared/GoalLineItems.generated';
import {
  PdsGoalCalculationDocument,
  PdsGoalCalculationQuery,
  PdsGoalCalculationQueryVariables,
  PdsGoalCalculationsDocument,
  PdsGoalCalculationsQuery,
  PdsGoalCalculationsQueryVariables,
} from './GoalsList/PdsGoalCalculations.generated';
import {
  HcmUserDocument,
  HcmUserQuery,
  HcmUserQueryVariables,
} from './Shared/HCM.generated';
import { PdsGoalCalculatorProvider } from './Shared/PdsGoalCalculatorContext';

const calculationsDefault = gqlMock<
  PdsGoalCalculationsQuery,
  PdsGoalCalculationsQueryVariables
>(PdsGoalCalculationsDocument, {
  mocks: {
    designationSupportCalculations: {
      nodes: [
        {
          id: 'goal-1',
          name: 'Test Goal',
          formType: DesignationSupportFormType.Detailed,
          status: DesignationSupportStatus.FullTime,
          salaryOrHourly: DesignationSupportSalaryType.Salaried,
          payRate: 50000,
          hoursWorkedPerWeek: null,
          averageHoursPerWeek: 0,
          benefits: 1500,
          geographicLocation: null,
          ministryCellPhone: 0,
          ministryInternet: 0,
          mpdNewsletter: 0,
          mpdMiscellaneous: 0,
          accountTransfers: 0,
          otherMonthlyReimbursements: 0,
          conferenceRetreatCosts: 0,
          ministryTravelMeals: 0,
          otherAnnualReimbursements: 0,
          designationSupportHoursItems: [],
        },
      ],
      pageInfo: {
        endCursor: null,
        hasNextPage: false,
      },
    },
  },
}).designationSupportCalculations;

export type PdsGoalCalculationsMock = DeepPartial<
  PdsGoalCalculationsQuery['designationSupportCalculations']
>;

export type PdsGoalCalculationMock = DeepPartial<
  PdsGoalCalculationQuery['designationSupportCalculation']
>;

const calculationDefault = gqlMock<
  PdsGoalCalculationQuery,
  PdsGoalCalculationQueryVariables
>(PdsGoalCalculationDocument, {
  mocks: {
    designationSupportCalculation: {
      id: 'goal-1',
      name: 'Test Goal',
      formType: DesignationSupportFormType.Detailed,
      status: DesignationSupportStatus.FullTime,
      salaryOrHourly: DesignationSupportSalaryType.Salaried,
      payRate: 50000,
      hoursWorkedPerWeek: null,
      averageHoursPerWeek: 0,
      benefits: 1500,
      geographicLocation: null,
      ministryCellPhone: 0,
      ministryInternet: 0,
      mpdNewsletter: 0,
      mpdMiscellaneous: 0,
      accountTransfers: 0,
      otherMonthlyReimbursements: 0,
      conferenceRetreatCosts: 0,
      ministryTravelMeals: 0,
      otherAnnualReimbursements: 0,
      designationSupportHoursItems: [],
    },
  },
  variables: { id: 'goal-1' },
}).designationSupportCalculation;

const hcmUserDefault = gqlMock<HcmUserQuery, HcmUserQueryVariables>(
  HcmUserDocument,
  {
    mocks: {
      hcm: [
        {
          fourOThreeB: {
            currentTaxDeferredContributionPercentage: 0,
            currentRothContributionPercentage: 0,
          },
        },
      ],
    },
  },
);

export type HcmUserMock = DeepPartial<HcmUserQuery['hcm'][number]>;
export type GetUserMock = DeepPartial<GetUserQuery>;

export type GoalCalculatorConstantsMock = DeepPartial<
  GoalCalculatorConstantsQuery['constant']
>;

export interface PdsGoalCalculatorTestWrapperProps<
  TExtraMocks = Record<string, never>,
> {
  children?: React.ReactNode;
  withProvider?: boolean;
  calculationsMock?: PdsGoalCalculationsMock;
  calculationMock?: PdsGoalCalculationMock;
  hcmUserMock?: HcmUserMock | null;
  userMock?: GetUserMock;
  constantsMock?: GoalCalculatorConstantsMock;
  supportRaisedMock?: number;
  /**
   * Extra GqlMockedProvider mocks merged on top of the defaults. Pass the
   * operation map as a generic argument so mock shapes are type-checked:
   * `<PdsGoalCalculatorTestWrapper<{ UpdatePdsGoalCalculation: UpdatePdsGoalCalculationMutation }> extraMocks={...} />`.
   * Each value may be a partial mock object or a resolver function (e.g. to
   * throw and exercise error paths).
   */
  extraMocks?: {
    [K in keyof TExtraMocks]?:
      | DeepPartial<TExtraMocks[K]>
      | ((...args: never[]) => unknown);
  };
  onCall?: MockLinkCallHandler;
  router?: React.ComponentProps<typeof TestRouter>['router'];
}

export const PdsGoalCalculatorTestWrapper = <
  TExtraMocks = Record<string, never>,
>({
  children,
  withProvider = true,
  calculationsMock,
  calculationMock,
  hcmUserMock,
  userMock,
  constantsMock,
  supportRaisedMock,
  extraMocks,
  onCall,
  router,
}: PdsGoalCalculatorTestWrapperProps<TExtraMocks>): React.ReactElement => {
  return (
    <ThemeProvider theme={theme}>
      <TestRouter
        router={{
          query: { accountListId: 'abc123', pdsGoalId: 'goal-1' },
          ...router,
        }}
      >
        <SnackbarProvider>
          <GqlMockedProvider<{
            PdsGoalCalculations: PdsGoalCalculationsQuery;
            PdsGoalCalculation: PdsGoalCalculationQuery;
            GoalCalculatorConstants: GoalCalculatorConstantsQuery;
            HcmUser: HcmUserQuery;
            GetUser: GetUserQuery;
            AccountListSupportRaised: AccountListSupportRaisedQuery;
          }>
            mocks={merge(
              {
                PdsGoalCalculations: {
                  designationSupportCalculations: merge(
                    {},
                    calculationsDefault,
                    calculationsMock,
                  ),
                },
                PdsGoalCalculation: {
                  designationSupportCalculation: merge(
                    {},
                    calculationDefault,
                    calculationMock,
                  ),
                },
                HcmUser: {
                  hcm:
                    hcmUserMock === null
                      ? []
                      : [merge({}, hcmUserDefault.hcm[0], hcmUserMock)],
                },
                ...(userMock ? { GetUser: userMock } : {}),
                ...(supportRaisedMock !== undefined
                  ? {
                      AccountListSupportRaised: {
                        accountList: {
                          id: 'account-list-1',
                          receivedPledges: supportRaisedMock,
                        },
                      },
                    }
                  : {}),
                GoalCalculatorConstants: {
                  constant: mergeWith(
                    {},
                    {
                      mpdGoalBenefitsConstants: [],
                      mpdGoalGeographicConstants: [
                        {
                          location: 'None',
                          percentageMultiplier: 0,
                        },
                        {
                          location: 'Orlando, FL',
                          percentageMultiplier: 0.06,
                        },
                        {
                          location: 'New York, NY',
                          percentageMultiplier: 0.12,
                        },
                      ],
                      mpdGoalMiscConstants: [
                        {
                          category:
                            MpdGoalMiscConstantCategoryEnum.AdditionalRates,
                          label: MpdGoalMiscConstantLabelEnum.EmployerFicaRate,
                          fee: 0.08,
                        },
                        {
                          category:
                            MpdGoalMiscConstantCategoryEnum.AdditionalRates,
                          label:
                            MpdGoalMiscConstantLabelEnum.PartTimeWorkCompensation,
                          fee: 0.17,
                        },
                        {
                          category: MpdGoalMiscConstantCategoryEnum.Rates,
                          label: MpdGoalMiscConstantLabelEnum.AttritionRate,
                          fee: 0.06,
                        },
                        {
                          category:
                            MpdGoalMiscConstantCategoryEnum.AdditionalRates,
                          label: MpdGoalMiscConstantLabelEnum.CreditCardFeeRate,
                          fee: 0.06,
                        },
                        {
                          category: MpdGoalMiscConstantCategoryEnum.Rates,
                          label: MpdGoalMiscConstantLabelEnum.AdminRate,
                          fee: 0.12,
                        },
                      ],
                    },
                    constantsMock,
                    (_objValue, srcValue) =>
                      Array.isArray(srcValue) ? srcValue : undefined,
                  ),
                },
              },
              extraMocks,
            )}
            onCall={onCall}
          >
            {withProvider ? (
              <PdsGoalCalculatorProvider>{children}</PdsGoalCalculatorProvider>
            ) : (
              // eslint-disable-next-line react/jsx-no-useless-fragment
              <>{children}</>
            )}
          </GqlMockedProvider>
        </SnackbarProvider>
      </TestRouter>
    </ThemeProvider>
  );
};
