import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { render } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { MpdGoalHeaderCards } from './MpdGoalHeaderCards';
import type { Goal } from '../../../Shared/useReportExpenses/useReportExpenses';

const mockGoal = {
  netMonthlySalary: 5000,
  taxesPercentage: 0.25,
  rothContributionPercentage: 0.1,
  traditionalContributionPercentage: 0.5,
  ministryExpenses: {
    benefitsCharge: 0,
    primaryCategories: [],
  },
  ministryExpensesTotal: 2080,
};

const TestComponent = ({ goal }: { goal: Goal }) => (
  <TestRouter>
    <SnackbarProvider>
      <ThemeProvider theme={theme}>
        <GqlMockedProvider>
          <MpdGoalHeaderCards goal={goal} />
        </GqlMockedProvider>
      </ThemeProvider>
    </SnackbarProvider>
  </TestRouter>
);

// Avoid searching for calculated values in the event that calculations change
describe('MpdGoalHeaderCards', () => {
  it('renders the headings and values', () => {
    const { getByRole } = render(<TestComponent goal={mockGoal} />);
    expect(getByRole('heading', { name: 'Your Goal' })).toBeInTheDocument();
    expect(getByRole('heading', { name: /\$\d/ })).toBeInTheDocument();
    expect(getByRole('heading', { name: 'Progress' })).toBeInTheDocument();
    expect(getByRole('heading', { name: /\d+%/ })).toBeInTheDocument();
  });
});
