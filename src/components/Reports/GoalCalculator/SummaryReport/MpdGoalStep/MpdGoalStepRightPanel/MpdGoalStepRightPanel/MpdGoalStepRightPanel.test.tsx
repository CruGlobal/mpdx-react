import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { GoalCalculatorProvider } from 'src/components/Reports/GoalCalculator/Shared/GoalCalculatorContext';
import theme from 'src/theme';
import { MpdGoalStepRightPanel } from './MpdGoalStepRightPanel';

const TestComponent = () => {
  return (
    <SnackbarProvider>
      <ThemeProvider theme={theme}>
        <GoalCalculatorProvider>
          <MpdGoalStepRightPanel />
        </GoalCalculatorProvider>
      </ThemeProvider>
    </SnackbarProvider>
  );
};

describe('MpdGoalStepRightPanel', () => {
  it('renders the resources and table title', () => {
    const { getByTestId } = render(<TestComponent />);
    expect(getByTestId('resource-title')).toBeInTheDocument();
    expect(getByTestId('table-title')).toBeInTheDocument();
  });

  it('renders the accordions', () => {
    const { getByTestId } = render(<TestComponent />);
    expect(getByTestId('accordions')).toBeInTheDocument();
  });

  it('renders the close button', async () => {
    const { getByRole } = render(<TestComponent />);
    const closeButton = getByRole('button', { name: 'Close Panel' });
    expect(closeButton).toBeInTheDocument();
  });

  it('renders the tab panel only for the active tab', () => {
    const { getByText } = render(<TestComponent />);
    expect(getByText('MPD Goal Calculation Table')).toBeVisible();
  });
});
