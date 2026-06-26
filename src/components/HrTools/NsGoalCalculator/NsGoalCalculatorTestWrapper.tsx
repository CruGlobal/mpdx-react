import { ThemeProvider } from '@mui/material/styles';
import { ErgonoMockedProviderProps } from 'graphql-ergonomock';
import { SnackbarProvider } from 'notistack';
import { DeepPartial } from 'ts-essentials';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { NewStaffQuestionnaireMaritalStatusEnum } from 'src/graphql/types.generated';
import { GoalCalculatorConstantsQuery } from 'src/hooks/goalCalculatorConstants.generated';
import theme from 'src/theme';
import { constantsMock } from '../GoalCalculator/GoalCalculatorTestWrapper';
import { AccountListSupportRaisedQuery } from '../GoalCalculator/Shared/GoalLineItems.generated';
import { NewStaffGoalCalculationQuery } from './GoalSettings/NewStaffGoalCalculation.generated';
import { NsGoalCalculatorProvider } from './Shared/NsGoalCalculatorContext';

/** Default couple calculation so the Goal Settings form renders with data. */
const defaultGoalCalculationMock: DeepPartial<NewStaffGoalCalculationQuery> = {
  newStaffGoalCalculation: {
    id: 'goal-calculation-1',
    firstName: 'John',
    lastName: 'Doe',
    spouseFirstName: 'Jane',
    spouseEmailAddress: 'jane.doe@cru.org',
    maritalStatus: NewStaffQuestionnaireMaritalStatusEnum.Married,
    spouseJoining: false,
    // Computed worksheet — null until the API calc engine lands.
    calculatedResults: null,
  },
};

export interface NsGoalCalculatorTestWrapperProps {
  children?: React.ReactNode;
  supportRaisedMock?: number;
  goalCalculationMock?: DeepPartial<NewStaffGoalCalculationQuery>;
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
          accountListId: 'account-list-1',
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
                id: 'account-list-1',
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
