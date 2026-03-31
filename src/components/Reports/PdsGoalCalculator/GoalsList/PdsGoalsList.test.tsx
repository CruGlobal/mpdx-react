import React from 'react';
import { render } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { PdsGoalCalculatorTestWrapper } from '../PdsGoalCalculatorTestWrapper';
import { PdsGoalsList } from './PdsGoalsList';

const router = {
  query: { accountListId: 'abc123' },
  isReady: true,
  push: jest.fn(),
};

describe('PdsGoalsList', () => {
  it('renders the create button', () => {
    const { getByRole } = render(
      <PdsGoalCalculatorTestWrapper router={router} withProvider={false}>
        <GqlMockedProvider>
          <PdsGoalsList />
        </GqlMockedProvider>
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(
      getByRole('button', { name: 'Create a New Goal' }),
    ).toBeInTheDocument();
  });
});
