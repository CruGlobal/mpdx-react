import React from 'react';
import { render, waitFor } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GoalCalculationsQuery } from './GoalCalculations.generated';
import { GoalsList } from './GoalsList';

const mutationSpy = jest.fn();

interface TestComponentProps {
  noGoals?: boolean;
  hasNextPage?: boolean;
  endCursor?: string | null;
}

const TestComponent: React.FC<TestComponentProps> = ({
  noGoals = false,
  hasNextPage = false,
  endCursor = null,
}) => (
  <TestRouter
    router={{
      query: { accountListId: 'account-list-1' },
    }}
  >
    <GqlMockedProvider<{ GoalCalculations: GoalCalculationsQuery }>
      mocks={{
        GoalCalculations: {
          goalCalculations: {
            nodes: noGoals
              ? []
              : [
                  { name: 'Monthly Support Goal' },
                  { name: 'Annual Giving Goal' },
                  { name: 'Partnership Goal' },
                ],
            pageInfo: {
              endCursor,
              hasNextPage,
            },
          },
        },
      }}
      onCall={mutationSpy}
    >
      <GoalsList />
    </GqlMockedProvider>
  </TestRouter>
);

describe('GoalsList', () => {
  it('renders the header and buttons', async () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('heading', { name: 'Good Morning, User.' }),
    ).toBeInTheDocument();
    expect(
      getByRole('button', { name: 'Create a New Goal' }),
    ).toBeInTheDocument();
    expect(
      getByRole('button', { name: 'Learn About Goalsetting' }),
    ).toBeInTheDocument();
  });

  it('renders loading state', async () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders goal calculations', async () => {
    const { findByRole, queryByRole } = render(<TestComponent />);

    expect(
      await findByRole('heading', { name: 'Monthly Support Goal' }),
    ).toBeInTheDocument();
    expect(queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('renders placeholder when there are no goals', async () => {
    const { findByRole } = render(<TestComponent noGoals />);

    expect(await findByRole('img')).toBeInTheDocument();
  });

  it('fetches additional pages when hasNextPage is true', async () => {
    render(<TestComponent hasNextPage endCursor="cursor-1" />);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('GoalCalculations', {
        accountListId: 'account-list-1',
        after: 'cursor-1',
      }),
    );
  });
});
