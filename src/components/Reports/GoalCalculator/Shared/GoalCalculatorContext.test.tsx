import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import theme from 'src/theme';
import { GoalCalculatorStepEnum } from '../GoalCalculatorHelper';
import {
  GoalCalculatorProvider,
  useGoalCalculator,
} from './GoalCalculatorContext';

const TestComponent: React.FC = () => {
  const {
    currentStep,
    isDrawerOpen,
    handleStepChange,
    handleContinue,
    toggleDrawer,
  } = useGoalCalculator();

  return (
    <div>
      <h2>{currentStep?.title}</h2>
      <div aria-label="drawer state" data-open={isDrawerOpen}>
        Drawer: {isDrawerOpen ? 'open' : 'closed'}
      </div>
      <button
        onClick={() =>
          handleStepChange(GoalCalculatorStepEnum.HouseholdExpenses)
        }
      >
        Change Step
      </button>
      <button onClick={handleContinue}>Continue</button>
      <button onClick={toggleDrawer}>Toggle Drawer</button>
    </div>
  );
};

const WrappedTestComponent: React.FC = () => (
  <SnackbarProvider>
    <ThemeProvider theme={theme}>
      <GoalCalculatorProvider>
        <TestComponent />
      </GoalCalculatorProvider>
    </ThemeProvider>
  </SnackbarProvider>
);

describe('GoalCalculatorContext', () => {
  it('should provide initial state', () => {
    const { getByRole } = render(<WrappedTestComponent />);

    expect(getByRole('heading')).toHaveTextContent('Calculator Settings');
  });

  it('should handle step change', () => {
    const { getByRole } = render(<WrappedTestComponent />);

    userEvent.click(getByRole('button', { name: 'Change Step' }));
    expect(getByRole('heading')).toHaveTextContent('Household Expenses');
  });

  it('should handle continue to next step', () => {
    const { getByRole } = render(<WrappedTestComponent />);

    userEvent.click(getByRole('button', { name: 'Continue' }));
    expect(getByRole('heading')).toHaveTextContent('Household Expenses');
  });

  it('should toggle drawer state', () => {
    const { getByRole, getByLabelText } = render(<WrappedTestComponent />);

    const drawerState = getByLabelText('drawer state');
    expect(drawerState).toHaveAttribute('data-open', 'true');

    userEvent.click(getByRole('button', { name: 'Toggle Drawer' }));
    expect(drawerState).toHaveAttribute('data-open', 'false');
  });
});
