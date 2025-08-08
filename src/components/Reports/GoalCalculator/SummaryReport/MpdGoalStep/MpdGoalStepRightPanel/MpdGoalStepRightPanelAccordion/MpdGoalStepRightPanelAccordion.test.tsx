import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { GoalCalculatorProvider } from 'src/components/Reports/GoalCalculator/Shared/GoalCalculatorContext';
import theme from 'src/theme';
import { MpdGoalStepRightPanelAccordion } from './MpdGoalStepRightPanelAccordion';

const TestComponent = () => (
  <SnackbarProvider>
    <ThemeProvider theme={theme}>
      <GoalCalculatorProvider>
        <MpdGoalStepRightPanelAccordion />
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
      getByRole('button', { name: '1B Taxes, SECA, VTL, etc. %' }),
    ).toBeInTheDocument();
    expect(
      getByRole('button', { name: '1C Taxes, SECA, VTL, etc.' }),
    ).toBeInTheDocument();
    expect(
      getByRole('button', { name: '1D Subtotal with Net, Taxes, and SECA' }),
    ).toBeInTheDocument();
    expect(
      getByRole('button', { name: '1E Roth 403(b) Contribution' }),
    ).toBeInTheDocument();
    expect(
      getByRole('button', { name: '1F 100% - Roth + Traditional 403(b) %' }),
    ).toBeInTheDocument();
    expect(
      getByRole('button', { name: '1G Roth 403(b), Traditional 403b' }),
    ).toBeInTheDocument();
    expect(
      getByRole('button', { name: '1H Gross Annual Salary' }),
    ).toBeInTheDocument();
    expect(
      getByRole('button', { name: '1I Gross Monthly Salary' }),
    ).toBeInTheDocument();
    expect(
      getByRole('button', { name: '1J Benefits Charge' }),
    ).toBeInTheDocument();
    expect(
      getByRole('button', { name: '1 Ministry Mileage' }),
    ).toBeInTheDocument();
    expect(
      getByRole('button', { name: '2 Medical Mileage' }),
    ).toBeInTheDocument();
    expect(
      getByRole('button', { name: '3 Medical Expenses' }),
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
