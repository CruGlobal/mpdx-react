import { ThemeProvider } from '@emotion/react';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { MpdGoalTable } from './MpdGoalTable';

const goal = {
  netMonthlySalary: 5000,
  taxesPercentage: 0.25,
  rothContributionPercentage: 0.1,
  traditionalContributionPercentage: 0.5,
  ministryExpenses: {
    benefitsCharge: 100,
    ministryMileage: 110,
    medicalMileage: 120,
    medicalExpenses: 130,
    ministryPartnerDevelopment: 140,
    communications: 150,
    entertainment: 160,
    staffDevelopment: 170,
    supplies: 180,
    technology: 190,
    travel: 200,
    transfers: 210,
    other: 220,
  },
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
      name: /Total Goal/,
    }).parentElement;
    expect(totalGoalRow).toHaveClass('bold', 'top-border');

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
