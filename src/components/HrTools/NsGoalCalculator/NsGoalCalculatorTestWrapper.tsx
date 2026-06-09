import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { NsGoalCalculatorProvider } from './Shared/NsGoalCalculatorContext';

interface NsGoalCalculatorTestWrapperProps {
  children?: React.ReactNode;
}

export const NsGoalCalculatorTestWrapper: React.FC<
  NsGoalCalculatorTestWrapperProps
> = ({ children }) => (
  <ThemeProvider theme={theme}>
    <TestRouter
      router={{
        query: {
          accountListId: 'account-list-1',
        },
      }}
    >
      <SnackbarProvider>
        <NsGoalCalculatorProvider>{children}</NsGoalCalculatorProvider>
      </SnackbarProvider>
    </TestRouter>
  </ThemeProvider>
);
