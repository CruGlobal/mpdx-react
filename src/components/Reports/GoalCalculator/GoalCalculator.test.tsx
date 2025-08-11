import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { GoalCalculator } from './GoalCalculator';
import { GoalCalculatorProvider } from './Shared/GoalCalculatorContext';

const TestComponent: React.FC = () => (
  <SnackbarProvider>
    <TestRouter router={{ query: { accountListId: 'test-account-list-id' } }}>
      <ThemeProvider theme={theme}>
        <GoalCalculatorProvider>
          <GoalCalculator />
        </GoalCalculatorProvider>
      </ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

describe('GoalCalculator', () => {
  it('should render step icons, continue, and back button', () => {
    const { getByTestId, getByRole } = render(<TestComponent />);

    expect(getByTestId('step-icon-calculator-settings')).toBeInTheDocument();
    expect(getByTestId('step-icon-ministry-expenses')).toBeInTheDocument();
    expect(getByTestId('step-icon-household-expenses')).toBeInTheDocument();
    expect(getByTestId('step-icon-summary-report')).toBeInTheDocument();
    expect(getByTestId('back-button')).toBeInTheDocument();

    const continueButton = getByRole('button', { name: 'Continue' });
    expect(continueButton).toBeInTheDocument();
  });
});
