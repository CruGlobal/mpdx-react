import { NextRouter } from 'next/router';
import { ThemeProvider } from '@mui/material/styles';
import {
  ApolloErgonoMockMap,
  ErgonoMockedProviderProps,
} from 'graphql-ergonomock';
import { SnackbarProvider } from 'notistack';
import { DeepPartial } from 'ts-essentials';
import TestRouter from '__tests__/util/TestRouter';
import {
  DeepPartialMock,
  GqlMockedProvider,
  gqlMock,
} from '__tests__/util/graphqlMocking';
import { NewStaffQuestionnaireMaritalStatusEnum } from 'src/graphql/types.generated';
import { GoalCalculatorConstantsQuery } from 'src/hooks/goalCalculatorConstants.generated';
import theme from 'src/theme';
import { constantsMock } from '../GoalCalculator/GoalCalculatorTestWrapper';
import { SendNewStaffScenarioGoalMutation } from '../Shared/SendScenarioGoal/SendScenarioGoal.generated';
import {
  NewStaffGoalCalculationDocument,
  NewStaffGoalCalculationQuery,
  NewStaffGoalCalculationQueryVariables,
  PreviewNewStaffGoalCalculationMutation,
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

/** Scenario sends echo back the address the default scenario fixture carries. */
const sendScenarioGoalMock: DeepPartialMock<SendNewStaffScenarioGoalMutation> =
  {
    sendNewStaffScenarioGoal: {
      newStaffGoalCalculation: { id: 'scenario-1' },
      sentTo: ['john@example.com'],
    },
  };

export interface NsGoalCalculatorTestWrapperProps {
  children?: React.ReactNode;
  /**
   * Overrides the NewStaffGoalCalculation query response.
   * Serves both real (account-list) and scenario (by-id) goals,
   * which share the query.
   */
  goalCalculationMock?:
    | DeepPartialMock<NewStaffGoalCalculationQuery>
    | ApolloErgonoMockMap;
  previewMock?: DeepPartial<PreviewNewStaffGoalCalculationMutation>;
  onCall?: ErgonoMockedProviderProps['onCall'];
  router?: Partial<NextRouter>;
}

export const NsGoalCalculatorTestWrapper: React.FC<
  NsGoalCalculatorTestWrapperProps
> = ({
  children,
  goalCalculationMock = defaultGoalCalculationMock,
  previewMock,
  onCall,
  router = { query: { accountListId } },
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <SnackbarProvider>
        <GqlMockedProvider<{
          GoalCalculatorConstants: GoalCalculatorConstantsQuery;
          NewStaffGoalCalculation: NewStaffGoalCalculationQuery;
          PreviewNewStaffGoalCalculation: PreviewNewStaffGoalCalculationMutation;
          SendNewStaffScenarioGoal: SendNewStaffScenarioGoalMutation;
        }>
          mocks={{
            GoalCalculatorConstants: { constant: constantsMock },
            NewStaffGoalCalculation: goalCalculationMock,
            PreviewNewStaffGoalCalculation: previewMock ?? {},
            SendNewStaffScenarioGoal: sendScenarioGoalMock,
          }}
          onCall={onCall}
        >
          <NsGoalCalculatorProvider>{children}</NsGoalCalculatorProvider>
        </GqlMockedProvider>
      </SnackbarProvider>
    </TestRouter>
  </ThemeProvider>
);
