import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { GoalCalculatorProvider } from 'src/components/Reports/GoalCalculator/Shared/GoalCalculatorContext';
import theme from 'src/theme';
import { MpdGoalStepRightPanelAccordions } from './MpdGoalStepRightPanelAccordions';

const TestComponent = () => (
  <SnackbarProvider>
    <ThemeProvider theme={theme}>
      <GoalCalculatorProvider>
        <MpdGoalStepRightPanelAccordions />
      </GoalCalculatorProvider>
    </ThemeProvider>
  </SnackbarProvider>
);

describe('MpdGoalStepRightPanelAccordion', () => {
  it('renders all accordion items with correct titles', () => {
    const { getByRole } = render(<TestComponent />);
    expect(
      getByRole('button', { name: '1A Net Monthly Combined Salary' }),
    ).toBeInTheDocument();
    expect(
      getByRole('button', { name: '1 Ministry Mileage' }),
    ).toBeInTheDocument();
  });

  it('renders accordion details content when expanded', () => {
    const { getByRole, getByTestId } = render(<TestComponent />);

    const accordion = getByRole('button', {
      name: '1A Net Monthly Combined Salary',
    });

    userEvent.click(accordion);
    expect(getByTestId('content-1-typography')).toBeInTheDocument();
  });

  it('applies extra spacing for items with hasSpace', () => {
    const { getByText } = render(<TestComponent />);
    // Find an item with hasSpace
    const grossAnnualSalary = getByText('Gross Annual Salary').closest(
      '.MuiAccordion-root',
    );
    expect(grossAnnualSalary).toHaveStyle({
      marginBottom: expect.stringContaining('px'),
    });
  });
});
