import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { PdsGoalCalculatorProvider } from '../Shared/PdsGoalCalculatorContext';
import { ReimbursableExpensesStep } from './ReimbursableExpensesStep';

const router = {
  query: { accountListId: 'abc123' },
  isReady: true,
};

describe('ReimbursableExpensesStep', () => {
  it('renders the reimbursable expenses step placeholder', () => {
    const { getAllByText } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <TestRouter router={router}>
            <PdsGoalCalculatorProvider>
              <ReimbursableExpensesStep />
            </PdsGoalCalculatorProvider>
          </TestRouter>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    expect(getAllByText('Reimbursable Expenses').length).toBeGreaterThan(0);
  });
});
