import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import {
  GoalCalculatorTestWrapper,
  goalCalculationMock,
} from '../../../GoalCalculatorTestWrapper';
import { GoalCalculationQuery } from '../../../Shared/GoalCalculation.generated';
import { InformationCategory } from './InformationCategory';

const TestComponent = () => (
  <GoalCalculatorTestWrapper>
    <GqlMockedProvider<{
      GoalCalculation: GoalCalculationQuery;
      GetUser: GetUserQuery;
    }>
      mocks={{
        GoalCalculation: goalCalculationMock,
        GetUser: {
          user: {
            id: 'user-id-1',
            firstName: 'Obi',
            lastName: 'Wan',
            avatar: 'avatar.jpg',
          },
        },
      }}
    >
      <InformationCategory />
    </GqlMockedProvider>
  </GoalCalculatorTestWrapper>
);

describe('InformationCategory', () => {
  it('toggles to spouse information when button is clicked', async () => {
    const { getByRole, queryByTestId, getByTestId } = render(<TestComponent />);

    expect(queryByTestId('spouse-personal-tab')).not.toBeInTheDocument();
    expect(queryByTestId('spouse-financial-tab')).not.toBeInTheDocument();

    userEvent.click(getByRole('button', { name: 'View Spouse' }));

    expect(getByTestId('spouse-personal-tab')).toBeInTheDocument();
    expect(getByTestId('spouse-financial-tab')).toBeInTheDocument();
  });

  it('shows user information by default', () => {
    const { getByTestId, getByRole } = render(<TestComponent />);

    expect(getByRole('button', { name: 'View Spouse' })).toBeInTheDocument();
    expect(getByTestId('personal-tab')).toBeInTheDocument();
    expect(getByTestId('financial-tab')).toBeInTheDocument();
  });

  it("renders the user's first name", async () => {
    const { getByTestId } = render(<TestComponent />);
    await waitFor(() => {
      expect(getByTestId('info-name-typography')).toHaveTextContent('Obi');
    });
  });

  it("renders the user's avatar", async () => {
    const { findByRole } = render(<TestComponent />);
    expect(await findByRole('img')).toBeInTheDocument();
  });
});
