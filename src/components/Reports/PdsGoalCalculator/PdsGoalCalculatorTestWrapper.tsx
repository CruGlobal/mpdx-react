import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { PdsGoalCalculatorProvider } from './Shared/PdsGoalCalculatorContext';

const defaultRouter = {
  query: { accountListId: 'abc123' },
  isReady: true,
};

interface PdsGoalCalculatorTestWrapperProps {
  children: React.ReactNode;
  router?: object;
  withProvider?: boolean;
}

export const PdsGoalCalculatorTestWrapper: React.FC<
  PdsGoalCalculatorTestWrapperProps
> = ({ children, router = defaultRouter, withProvider = true }) => {
  return (
    <SnackbarProvider>
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          {withProvider ? (
            <PdsGoalCalculatorProvider>{children}</PdsGoalCalculatorProvider>
          ) : (
            children
          )}
        </TestRouter>
      </ThemeProvider>
    </SnackbarProvider>
  );
};
