import React from 'react';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GoalsList } from './GoalsList';

const TestComponent = () => (
  <TestRouter>
    <GqlMockedProvider>
      <GoalsList />
    </GqlMockedProvider>
  </TestRouter>
);

describe('GoalsList', () => {
  it('renders the header and buttons', async () => {
    const { getByTestId, getByRole } = render(<TestComponent />);

    expect(getByTestId('welcome-typography')).toBeInTheDocument();
    expect(getByTestId('greeting-typography')).toBeInTheDocument();
    expect(
      getByRole('button', { name: 'Create a New Goal' }),
    ).toBeInTheDocument();
    expect(
      getByRole('button', { name: 'Learn About Goalsetting' }),
    ).toBeInTheDocument();
  });

  // Test this when we have actual goals data
  // it('renders GoalCards when provided', () => {});
  // it('shows empty state when no goals exist', () => {});
});
