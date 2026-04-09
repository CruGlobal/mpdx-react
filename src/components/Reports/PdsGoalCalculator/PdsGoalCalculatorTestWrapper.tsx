import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { MockLinkCallHandler } from 'graphql-ergonomock/dist/apollo/MockLink';
import { merge } from 'lodash';
import { SnackbarProvider } from 'notistack';
import { DeepPartial } from 'ts-essentials';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider, gqlMock } from '__tests__/util/graphqlMocking';
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

export interface PdsGoalCalculatorTestWrapperProps {
  children?: React.ReactNode;
  withProvider?: boolean;
  calculationsMock?: PdsGoalCalculationsMock;
  calculationMock?: PdsGoalCalculationMock;
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
              GoalCalculatorConstants: {
                constant: {
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
