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
import { AccountListSupportRaisedQuery } from '../GoalCalculator/Shared/GoalLineItems.generated';
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
  supportRaisedMock?: number;
  /** Overrides the NewStaffGoalCalculation query response */
  goalCalculationMock?:
    | DeepPartial<NewStaffGoalCalculationQuery>
    | ApolloErgonoMockMap;
  onCall?: ErgonoMockedProviderProps['onCall'];
}

export const NsGoalCalculatorTestWrapper: React.FC<
  NsGoalCalculatorTestWrapperProps
> = ({
  children,
  supportRaisedMock = 1200,
  goalCalculationMock = defaultGoalCalculationMock,
  onCall,
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter
      router={{
        query: {
          accountListId,
        },
      }}
    >
      <SnackbarProvider>
        <GqlMockedProvider<{
          AccountListSupportRaised: AccountListSupportRaisedQuery;
          GoalCalculatorConstants: GoalCalculatorConstantsQuery;
          NewStaffGoalCalculation: NewStaffGoalCalculationQuery;
        }>
          mocks={{
            AccountListSupportRaised: {
              accountList: {
                receivedPledges: supportRaisedMock,
              },
            },
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
