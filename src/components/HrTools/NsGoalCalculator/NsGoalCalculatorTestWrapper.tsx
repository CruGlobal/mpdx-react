import { NextRouter } from 'next/router';
import { ThemeProvider } from '@mui/material/styles';
import {
  ApolloErgonoMockMap,
  ErgonoMockedProviderProps,
} from 'graphql-ergonomock';
import { SnackbarProvider } from 'notistack';
import { DeepPartial } from 'ts-essentials';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider, gqlMock } from '__tests__/util/graphqlMocking';
import { NewStaffQuestionnaireMaritalStatusEnum } from 'src/graphql/types.generated';
import { GoalCalculatorConstantsQuery } from 'src/hooks/goalCalculatorConstants.generated';
import theme from 'src/theme';
import { constantsMock } from '../GoalCalculator/GoalCalculatorTestWrapper';
import {
  NewStaffGoalCalculationDocument,
  NewStaffGoalCalculationQuery,
  NewStaffGoalCalculationQueryVariables,
} from './GoalSettings/NewStaffGoalCalculation.generated';
import { NsGoalCalculatorProvider } from './Shared/NsGoalCalculatorContext';

const accountListId = 'account-list-1';

/** Default couple calculation so the Goal Settings form renders with data. */
export const defaultGoalCalculationMock = gqlMock<
  NewStaffGoalCalculationQuery,
  NewStaffGoalCalculationQueryVariables
>(NewStaffGoalCalculationDocument, {
  variables: { accountListId },
  mocks: {
    newStaffGoalCalculation: {
      id: 'goal-calculation-1',
      firstName: 'John',
      lastName: 'Doe',
      spouseFirstName: 'Jane',
      spouseEmailAddress: 'jane.doe@cru.org',
      maritalStatus: NewStaffQuestionnaireMaritalStatusEnum.Married,
      spouseJoining: true,
      ministryLocation: 'Lake Hart',
    },
  },
});

export const defaultGoalCalculation =
  defaultGoalCalculationMock.newStaffGoalCalculation!;

export interface NsGoalCalculatorTestWrapperProps {
  children?: React.ReactNode;
  /**
   * Overrides the NewStaffGoalCalculation query response.
   * Serves both real (account-list) and scenario (by-id) goals,
   * which share the query.
   */
  goalCalculationMock?:
    | DeepPartial<NewStaffGoalCalculationQuery>
    | ApolloErgonoMockMap;
  onCall?: ErgonoMockedProviderProps['onCall'];
  router?: Partial<NextRouter>;
}

export const NsGoalCalculatorTestWrapper: React.FC<
  NsGoalCalculatorTestWrapperProps
> = ({
  children,
  goalCalculationMock = defaultGoalCalculationMock,
  onCall,
  router = { query: { accountListId } },
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <SnackbarProvider>
        <GqlMockedProvider<{
          GoalCalculatorConstants: GoalCalculatorConstantsQuery;
          NewStaffGoalCalculation: NewStaffGoalCalculationQuery;
        }>
          mocks={{
            GoalCalculatorConstants: { constant: constantsMock },
            NewStaffGoalCalculation: goalCalculationMock,
          }}
          onCall={onCall}
        >
          <NsGoalCalculatorProvider>{children}</NsGoalCalculatorProvider>
        </GqlMockedProvider>
      </SnackbarProvider>
    </TestRouter>
  </ThemeProvider>
);
