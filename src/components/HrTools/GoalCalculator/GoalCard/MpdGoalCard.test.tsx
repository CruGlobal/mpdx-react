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
import { MpdGoalCard } from './MpdGoalCard';

const mutationSpy = jest.fn();

interface TestComponentProps {
  readOnly?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({ readOnly = false }) => (
  <TestRouter>
    <ThemeProvider theme={theme}>
      <GqlMockedProvider<{
        GoalCalculatorConstants: GoalCalculatorConstantsQuery;
      }>
        onCall={mutationSpy}
        mocks={{
          GoalCalculatorConstants: {
            constant: constantsMock,
          },
        }}
      >
        <MpdGoalCard
          goal={{ ...goalCalculationMock, id: 'goal-1', readOnly }}
        />
      </GqlMockedProvider>
    </ThemeProvider>
  </TestRouter>
);

describe('MpdGoalCard', () => {
  it('calls the delete mutation when the Delete button is confirmed', async () => {
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

  it('builds the View link with the goal calculator path', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('link', { name: 'View' })).toHaveAttribute(
      'href',
      '/accountLists/account-list-1/hrTools/goalCalculator/goal-1',
    );
  });

  it('calculates and displays the goal total', async () => {
    const { findByText } = render(<TestComponent />);

    expect(await findByText('$16,138.94')).toBeInTheDocument();
  });

  it('shows the skeleton while goal calculator constants are loading', () => {
    const { getByTestId } = render(<TestComponent />);

    expect(
      getByTestId('goal-amount-value').querySelector('.MuiSkeleton-root'),
    ).toBeInTheDocument();
  });

  describe('read-only goal', () => {
    it('hides the Delete button and shows the Read-Only badge', () => {
      const { getByText, getByRole, queryByRole } = render(
        <TestComponent readOnly />,
      );

      expect(queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
      expect(getByText('Read-Only')).toBeInTheDocument();
      expect(getByRole('link', { name: 'View' })).toBeInTheDocument();
    });
  });
});
