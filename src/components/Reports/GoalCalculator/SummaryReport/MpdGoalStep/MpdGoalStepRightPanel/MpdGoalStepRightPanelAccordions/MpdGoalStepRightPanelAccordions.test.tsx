import React from 'react';
import { render } from '@testing-library/react';
import { MpdGoalStepRightPanelAccordions } from './MpdGoalStepRightPanelAccordions';

describe('MpdGoalStepRightPanelAccordion', () => {
  it('renders accordion items with correct titles', () => {
    const { getByRole } = render(<MpdGoalStepRightPanelAccordions />);
    expect(
      getByRole('button', { name: '1A Net Monthly Combined Salary' }),
    ).toBeInTheDocument();
    expect(
      getByRole('button', { name: '1 Gross Monthly Salary' }),
    ).toBeInTheDocument();
    expect(
      getByRole('button', { name: '1J Gross Annual Salary' }),
    ).toBeInTheDocument();
    expect(getByRole('button', { name: '2 Benefits' })).toBeInTheDocument();
    expect(
      getByRole('button', { name: '3 Ministry Expenses' }),
    ).toBeInTheDocument();
    expect(
      getByRole('button', { name: '10 Support Goal Percentage Progress' }),
    ).toBeInTheDocument();
  });

  it('renders accordion details content when expanded', () => {
    const { getByTestId } = render(<MpdGoalStepRightPanelAccordions />);
    expect(getByTestId('content-1-typography')).toBeInTheDocument();
    expect(getByTestId('content-2-typography')).toBeInTheDocument();
  });

  it('applies extra spacing for items with hasSpace', () => {
    const { getByText } = render(<MpdGoalStepRightPanelAccordions />);
    // Find an item with hasSpace
    const grossAnnualSalary = getByText('Gross Annual Salary').closest(
      '.MuiAccordion-root',
    );
    expect(grossAnnualSalary).toHaveStyle({
      marginBottom: expect.stringContaining('px'),
    });
  });
});
