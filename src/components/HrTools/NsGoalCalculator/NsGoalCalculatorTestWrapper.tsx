import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { AccountListSupportRaisedQuery } from '../GoalCalculator/Shared/GoalLineItems.generated';
import { NsGoalCalculatorProvider } from './Shared/NsGoalCalculatorContext';

interface NsGoalCalculatorTestWrapperProps {
  children?: React.ReactNode;
  supportRaisedMock?: number;
}

export const NsGoalCalculatorTestWrapper: React.FC<
  NsGoalCalculatorTestWrapperProps
> = ({ children, supportRaisedMock = 1200 }) => (
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
        }>
          mocks={{
            AccountListSupportRaised: {
              accountList: {
                id: 'account-list-1',
                receivedPledges: supportRaisedMock,
              },
            },
          }}
        >
          <NsGoalCalculatorProvider>{children}</NsGoalCalculatorProvider>
        </GqlMockedProvider>
      </SnackbarProvider>
    </TestRouter>
  </ThemeProvider>
);
