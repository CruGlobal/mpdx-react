import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import { GoalCalculationAge } from 'src/graphql/types.generated';
import {
  GoalCalculatorTestWrapper,
  goalCalculationMock,
} from '../../../GoalCalculatorTestWrapper';
import { GoalCalculationQuery } from '../../../Shared/GoalCalculation.generated';
import { InformationCategory } from './InformationCategory';

const mutationSpy = jest.fn();

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
      onCall={mutationSpy}
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

  describe('autosave', () => {
    it('updates the first name', async () => {
      const { getByRole } = render(<TestComponent />);

      const input = getByRole('textbox', { name: 'First Name' });
      await waitFor(() => expect(input).toHaveValue('John'));

      userEvent.clear(input);
      userEvent.type(input, 'Jack');
      input.blur();

      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('UpdateGoalCalculation', {
          input: {
            accountListId: 'account-list-1',
            attributes: {
              id: 'test-goal-id',
              firstName: 'Jack',
            },
          },
        }),
      );
    });

    it('updates the spouse MHA amount', async () => {
      const { getByRole } = render(<TestComponent />);

      userEvent.click(getByRole('tab', { name: 'Financial' }));
      userEvent.click(getByRole('button', { name: 'View Spouse' }));
      const input = getByRole('spinbutton', {
        name: 'Spouse MHA Amount Per Paycheck',
      });
      await waitFor(() => expect(input).toHaveValue(500));

      userEvent.clear(input);
      userEvent.type(input, '750');
      input.blur();

      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('UpdateGoalCalculation', {
          input: {
            accountListId: 'account-list-1',
            attributes: {
              id: 'test-goal-id',
              spouseMhaAmount: 750,
            },
          },
        }),
      );
    });

    it('updates the years on staff', async () => {
      const { getByRole } = render(<TestComponent />);

      const input = getByRole('combobox', { name: 'Years on Staff' });
      await waitFor(() => expect(input).toHaveTextContent('5-9'));
      userEvent.click(input);
      userEvent.click(getByRole('option', { name: '10-14' }));

      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('UpdateGoalCalculation', {
          input: {
            accountListId: 'account-list-1',
            attributes: {
              id: 'test-goal-id',
              yearsOnStaff: 10,
            },
          },
        }),
      );
    });

    it('updates the age', async () => {
      const { getByRole } = render(<TestComponent />);

      const input = getByRole('combobox', { name: 'Age' });
      await waitFor(() => expect(input).toHaveTextContent('Under 30'));
      userEvent.click(input);
      userEvent.click(getByRole('option', { name: '30-34' }));

      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('UpdateGoalCalculation', {
          input: {
            accountListId: 'account-list-1',
            attributes: {
              id: 'test-goal-id',
              age: GoalCalculationAge.ThirtyToThirtyFour,
            },
          },
        }),
      );
    });

    it('updates the spouse SECA amount', async () => {
      const { getByRole } = render(<TestComponent />);

      await waitFor(() =>
        expect(getByRole('textbox', { name: 'First Name' })).toHaveValue(
          'John',
        ),
      );

      userEvent.click(getByRole('tab', { name: 'Financial' }));
      userEvent.click(getByRole('button', { name: 'View Spouse' }));
      userEvent.click(
        getByRole('combobox', {
          name: 'Spouse SECA (Social Security) Status',
        }),
      );
      userEvent.click(getByRole('option', { name: 'Exempt' }));

      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('UpdateGoalCalculation', {
          input: {
            accountListId: 'account-list-1',
            attributes: {
              id: 'test-goal-id',
              spouseSecaExempt: true,
            },
          },
        }),
      );
    });
  });
});
