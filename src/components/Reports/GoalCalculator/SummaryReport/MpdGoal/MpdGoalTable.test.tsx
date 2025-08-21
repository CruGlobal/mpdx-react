import { ThemeProvider } from '@emotion/react';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { MpdGoalTable } from './MpdGoalTable';
import type { MinistryExpenses } from '../useReportExpenses';

const goal = {
  netMonthlySalary: 5000,
  taxesPercentage: 0.25,
  rothContributionPercentage: 0.1,
  traditionalContributionPercentage: 0.5,
  ministryExpenses: {
    benefitsCharge: 0,
    primaryCategories: [],
  } as MinistryExpenses,
  ministryExpensesTotal: 2080,
};

const TestComponent: React.FC = () => (
  <TestRouter>
    <ThemeProvider theme={theme}>
      <GqlMockedProvider>
        <MpdGoalTable goal={goal} />
      </GqlMockedProvider>
    </ThemeProvider>
  </TestRouter>
);

describe('MpdGoalTable', () => {
  it('renders the table', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('grid', { name: 'MPD Goal' })).toBeInTheDocument();
  });

  it('adds classes to certain columns and rows', () => {
    const { getByRole } = render(<TestComponent />);

    const grossAnnualRow = getByRole('gridcell', {
      name: 'Gross Annual Salary',
    }).parentElement;
    expect(grossAnnualRow).toHaveClass('bold');

    const grossMonthlyRow = getByRole('gridcell', {
      name: 'Gross Monthly Salary',
    }).parentElement;
    expect(grossMonthlyRow).toHaveClass('top-border');

    const totalGoalRow = getByRole('gridcell', {
      name: 'Total Goal (line 16 x 1.06 attrition)',
    }).parentElement;
    expect(totalGoalRow).toHaveClass('top-border', 'bold');

    const monthlySupportRow = getByRole('gridcell', {
      name: 'Monthly Support to be Developed',
    }).parentElement;
    expect(monthlySupportRow).toHaveClass('bold');

    expect(
      getByRole('gridcell', { name: 'Net Monthly Combined Salary' }),
    ).toHaveClass('indent');
    expect(
      getByRole('gridcell', { name: 'Gross Monthly Salary' }),
    ).not.toHaveClass('indent');

    expect(getByRole('columnheader', { name: 'NS Reference' })).toHaveClass(
      'reference',
    );
    expect(getByRole('gridcell', { name: '$5,511.31' })).toHaveClass(
      'reference',
    );
  });
});
