import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { PdsGoalCalculatorProvider } from '../Shared/PdsGoalCalculatorContext';
import { SetupStep } from './SetupStep';

const router = {
  query: { accountListId: 'abc123' },
  isReady: true,
};

describe('SetupStep', () => {
  it('renders the setup step placeholder', () => {
    const { getAllByText } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <TestRouter router={router}>
            <PdsGoalCalculatorProvider>
              <SetupStep />
            </PdsGoalCalculatorProvider>
          </TestRouter>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    expect(getAllByText('Setup').length).toBeGreaterThan(0);
  });
});
