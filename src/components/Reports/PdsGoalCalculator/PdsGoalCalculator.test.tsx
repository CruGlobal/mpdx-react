import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { PdsGoalCalculator } from './PdsGoalCalculator';
import { PdsGoalCalculatorProvider } from './Shared/PdsGoalCalculatorContext';

const router = {
  query: { accountListId: 'abc123' },
  isReady: true,
};

describe('PdsGoalCalculator', () => {
  it('renders the setup step by default', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <TestRouter router={router}>
            <PdsGoalCalculatorProvider>
              <PdsGoalCalculator />
            </PdsGoalCalculatorProvider>
          </TestRouter>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    expect(getByRole('heading', { level: 5, name: 'Setup' })).toBeInTheDocument();
  });
});
