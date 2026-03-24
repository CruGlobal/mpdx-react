import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { PdsGoalCalculatorProvider } from '../Shared/PdsGoalCalculatorContext';
import { SalaryStep } from './SalaryStep';

const router = {
  query: { accountListId: 'abc123' },
  isReady: true,
};

describe('SalaryStep', () => {
  it('renders the salary step placeholder', () => {
    const { getAllByText } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <TestRouter router={router}>
            <PdsGoalCalculatorProvider>
              <SalaryStep />
            </PdsGoalCalculatorProvider>
          </TestRouter>
        </ThemeProvider>
      </SnackbarProvider>,
    );

    expect(getAllByText('Salary').length).toBeGreaterThan(0);
  });
});
