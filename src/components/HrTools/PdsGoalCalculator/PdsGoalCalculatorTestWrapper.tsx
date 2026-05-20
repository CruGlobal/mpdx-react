import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { GraphQLError } from 'graphql';
import { MockLinkCallHandler } from 'graphql-ergonomock/dist/apollo/MockLink';
import { merge, mergeWith } from 'lodash';
import { SnackbarProvider } from 'notistack';
import { DeepPartial } from 'ts-essentials';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider, gqlMock } from '__tests__/util/graphqlMocking';
import { UpdateAccountPreferencesMutation } from 'src/components/Settings/preferences/accordions/UpdateAccountPreferences.generated';
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
  UpdatePdsGoalCalculationMutation,
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
          ministryCellPhone: null,
          ministryInternet: null,
          mpdNewsletter: null,
          mpdMiscellaneous: null,
          accountTransfers: null,
          otherMonthlyReimbursements: null,
          conferenceRetreatCosts: null,
          ministryTravelMeals: null,
          otherAnnualReimbursements: null,
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
      ministryCellPhone: null,
      ministryInternet: null,
      mpdNewsletter: null,
      mpdMiscellaneous: null,
      accountTransfers: null,
      otherMonthlyReimbursements: null,
      conferenceRetreatCosts: null,
      ministryTravelMeals: null,
      otherAnnualReimbursements: null,
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

export interface PdsGoalCalculatorTestWrapperProps {
  children?: React.ReactNode;
  withProvider?: boolean;
  calculationsMock?: PdsGoalCalculationsMock;
  calculationMock?: PdsGoalCalculationMock;
  hcmUserMock?: HcmUserMock | null;
  userMock?: GetUserMock;
  constantsMock?: GoalCalculatorConstantsMock;
  supportRaisedMock?: number;
  supportRaisedError?: boolean;
  updateAccountPreferencesError?: boolean;
  updatePdsGoalCalculationError?: boolean;
  onCall?: MockLinkCallHandler;
  router?: React.ComponentProps<typeof TestRouter>['router'];
}

export const PdsGoalCalculatorTestWrapper: React.FC<
  PdsGoalCalculatorTestWrapperProps
> = ({
  children,
  withProvider = true,
  calculationsMock,
  calculationMock,
  hcmUserMock,
  userMock,
  constantsMock,
  supportRaisedMock,
  supportRaisedError,
  updateAccountPreferencesError,
  updatePdsGoalCalculationError,
  onCall,
  router,
}) => {
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
            UpdateAccountPreferences: UpdateAccountPreferencesMutation;
            UpdatePdsGoalCalculation: UpdatePdsGoalCalculationMutation;
          }>
            mocks={{
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
              ...(updateAccountPreferencesError
                ? {
                    UpdateAccountPreferences: {
                      updateAccountList: (() => {
                        throw new GraphQLError(
                          'Failed to update account preferences',
                        );
                      }) as unknown as NonNullable<
                        UpdateAccountPreferencesMutation['updateAccountList']
                      >,
                    },
                  }
                : {}),
              ...(updatePdsGoalCalculationError
                ? {
                    UpdatePdsGoalCalculation: {
                      updateDesignationSupportCalculation: (() => {
                        throw new GraphQLError(
                          'Failed to update calculation',
                        );
                      }) as unknown as NonNullable<
                        UpdatePdsGoalCalculationMutation['updateDesignationSupportCalculation']
                      >,
                    },
                  }
                : {}),
              ...(supportRaisedError
                ? {
                    AccountListSupportRaised: {
                      accountList: (() => {
                        throw new GraphQLError(
                          'Failed to load support raised',
                        );
                      }) as unknown as AccountListSupportRaisedQuery['accountList'],
                    },
                  }
                : supportRaisedMock !== undefined
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
            }}
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
