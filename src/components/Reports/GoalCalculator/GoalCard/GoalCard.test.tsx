import React from 'react';
import { ThemeProvider } from '@mui/system';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GoalCalculatorConstantsQuery } from 'src/hooks/goalCalculatorConstants.generated';
import theme from 'src/theme';
import {
  constantsMock,
  goalCalculationMock,
} from '../GoalCalculatorTestWrapper';
import { GoalCard } from './GoalCard';

const mutationSpy = jest.fn();

interface TestComponentProps {
  primary?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({ primary = false }) => (
  <TestRouter>
    <ThemeProvider theme={theme}>
      <GqlMockedProvider<{
        GoalCalculatorConstants: GoalCalculatorConstantsQuery;
      }>
        onCall={mutationSpy}
        mocks={{ GoalCalculatorConstants: constantsMock }}
      >
        <GoalCard
          goal={{ ...goalCalculationMock, id: 'goal-1', primary }}
          renderStar
        />
      </GqlMockedProvider>
    </ThemeProvider>
  </TestRouter>
);

describe('GoalCard', () => {
  it('renders goal title, amount, and date', () => {
    const { getByTestId } = render(<TestComponent />);
    expect(getByTestId('goal-name')).toBeInTheDocument();
    expect(getByTestId('goal-amount-value')).toBeInTheDocument();
    expect(getByTestId('date-value')).toBeInTheDocument();
  });

  it('calls update mutation when star button is clicked', async () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'star-button' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateGoalCalculation', {
        accountListId: 'account-list-1',
        attributes: {
          id: 'goal-1',
          primary: true,
        },
      }),
    );
  });

  it('shows filled star when primary', () => {
    const { getByTestId } = render(<TestComponent primary={true} />);
    expect(getByTestId('StarIcon')).toBeInTheDocument();
  });

  it('shows outlined star when not primary', () => {
    const { getByTestId } = render(<TestComponent primary={false} />);
    expect(getByTestId('StarBorderOutlinedIcon')).toBeInTheDocument();
  });

  it('opens confirmation dialog and calls delete mutation when delete button is clicked', async () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Delete' }));
    userEvent.click(getByRole('button', { name: 'Delete Goal' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('DeleteGoalCalculation', {
        accountListId: 'account-list-1',
        id: 'goal-1',
      }),
    );
  });

  it('renders view link', () => {
    const { getByRole } = render(<TestComponent />);
    expect(getByRole('link', { name: 'View' })).toHaveAttribute(
      'href',
      '/accountLists/account-list-1/reports/goalCalculator/goal-1',
    );
  });

  it('calculates goal total', () => {
    const { getByTestId } = render(<TestComponent />);
    expect(getByTestId('goal-amount-value')).toHaveTextContent('$7,814.89');
  });
});
