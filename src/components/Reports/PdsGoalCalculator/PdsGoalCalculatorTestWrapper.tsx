import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { MockLinkCallHandler } from 'graphql-ergonomock/dist/apollo/MockLink';
import { merge } from 'lodash';
import { SnackbarProvider } from 'notistack';
import { DeepPartial } from 'ts-essentials';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider, gqlMock } from '__tests__/util/graphqlMocking';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import {
  DesignationSupportSalaryType,
  DesignationSupportStatus,
} from 'src/graphql/types.generated';
import { GoalCalculatorConstantsQuery } from 'src/hooks/goalCalculatorConstants.generated';
import theme from 'src/theme';
import {
  PdsGoalCalculationQuery,
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
          status: DesignationSupportStatus.FullTime,
          salaryOrHourly: DesignationSupportSalaryType.Salaried,
          payRate: 50000,
          hoursWorkedPerWeek: null,
          benefits: 1500,
          geographicLocation: null,
        },
      ],
    },
  },
}).designationSupportCalculations;

export type PdsGoalCalculationsMock = DeepPartial<
  PdsGoalCalculationsQuery['designationSupportCalculations']
>;

export type PdsGoalCalculationMock = DeepPartial<
  PdsGoalCalculationQuery['designationSupportCalculation']
>;

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
          }>
            mocks={{
              PdsGoalCalculations: {
                designationSupportCalculations: merge(
                  {},
                  calculationsDefault,
                  calculationsMock,
                ),
              },
              ...(calculationMock
                ? {
                    PdsGoalCalculation: {
                      designationSupportCalculation: calculationMock,
                    },
                  }
                : {}),
              HcmUser: {
                hcm:
                  hcmUserMock === null
                    ? []
                    : [merge({}, hcmUserDefault.hcm[0], hcmUserMock)],
              },
              ...(userMock ? { GetUser: userMock } : {}),
              GoalCalculatorConstants: {
                constant: merge(
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
                    mpdGoalMiscConstants: [],
                  },
                  constantsMock,
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
