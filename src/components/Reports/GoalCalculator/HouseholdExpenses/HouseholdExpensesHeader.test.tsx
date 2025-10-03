import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  GoalCalculatorTestWrapper,
  goalCalculationMock,
} from '../GoalCalculatorTestWrapper';
import { GoalCalculationQuery } from '../Shared/GoalCalculation.generated';
import { HouseholdExpensesHeader } from './HouseholdExpensesHeader';

const accountListId = 'account-list-1';
const mutationSpy = jest.fn();

type TestComponentProps = {
  directInputNull?: boolean;
};

const TestComponent: React.FC<TestComponentProps> = ({
  directInputNull = false,
}) => (
  <GqlMockedProvider<{ GoalCalculation: GoalCalculationQuery }>
    mocks={{
      GoalCalculation: {
        goalCalculation: directInputNull
          ? {
              ...goalCalculationMock,
              householdFamily: {
                ...goalCalculationMock.householdFamily,
                directInput: null,
              },
            }
          : goalCalculationMock,
      },
    }}
    onCall={mutationSpy}
  >
    <GoalCalculatorTestWrapper noMocks>
      <HouseholdExpensesHeader />
    </GoalCalculatorTestWrapper>
  </GqlMockedProvider>
);

describe('HouseholdExpensesHeader', () => {
  describe('budgeted card', () => {
    it('should render loading state', async () => {
      const { queryByText, queryByRole } = render(<TestComponent />);

      expect(queryByText('$5,000')).not.toBeInTheDocument();
      expect(
        queryByRole('button', { name: 'Override paycheck amount' }),
      ).not.toBeInTheDocument();
      expect(
        queryByRole('button', { name: 'Use paycheck amount' }),
      ).not.toBeInTheDocument();
    });

    it('should render paycheck amount when direct input is null', async () => {
      const { findByText } = render(<TestComponent directInputNull />);

      expect(await findByText('$10,000')).toBeInTheDocument();
    });

    it('should render direct input total when it is set', async () => {
      const { findByText } = render(<TestComponent />);

      expect(await findByText('$5,500')).toBeInTheDocument();
    });

    it('use paycheck amount should update total', async () => {
      const { findByRole, getByText } = render(<TestComponent />);

      userEvent.click(
        await findByRole('button', { name: 'Use paycheck amount' }),
      );

      expect(getByText('$10,000')).toBeInTheDocument();
      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation(
          'UpdateHouseholdDirectInput',
          {
            accountListId,
            id: 'household-family',
            directInput: null,
          },
        ),
      );
    });

    it('should allow editing direct input when it is set', async () => {
      const { getByRole, findByText } = render(<TestComponent />);

      expect(await findByText('$5,500')).toBeInTheDocument();
      userEvent.click(getByRole('button', { name: 'Edit monthly budget' }));
      expect(
        getByRole('spinbutton', {
          name: 'Total monthly budget',
        }),
      ).toHaveValue(5500);
    });

    it('override paycheck amount should update total', async () => {
      const { findByRole, getByRole, getByText } = render(
        <TestComponent directInputNull />,
      );

      userEvent.click(
        await findByRole('button', { name: 'Override paycheck amount' }),
      );

      const directInputTextfield = getByRole('spinbutton', {
        name: 'Total monthly budget',
      });
      userEvent.clear(directInputTextfield);
      userEvent.type(directInputTextfield, '1234');
      userEvent.click(getByRole('button', { name: 'Save' }));

      expect(getByText('$1,234')).toBeInTheDocument();
      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation(
          'UpdateHouseholdDirectInput',
          {
            accountListId,
            id: 'household-family',
            directInput: 1234,
          },
        ),
      );
    });

    it('override should validate that amount is not negative', async () => {
      const { findByRole, getByRole, getByText } = render(
        <TestComponent directInputNull />,
      );

      userEvent.click(
        await findByRole('button', { name: 'Override paycheck amount' }),
      );

      const directInputTextfield = getByRole('spinbutton', {
        name: 'Total monthly budget',
      });
      userEvent.clear(directInputTextfield);
      userEvent.type(directInputTextfield, '-1');
      expect(getByRole('button', { name: 'Save' })).toBeDisabled();
      expect(getByText('Amount must be positive')).toBeInTheDocument();
    });

    it('cancel should abort setting override', async () => {
      const { findByRole, getByRole, getByText, queryByRole } = render(
        <TestComponent directInputNull />,
      );

      userEvent.click(
        await findByRole('button', { name: 'Override paycheck amount' }),
      );

      const directInputTextfield = getByRole('spinbutton', {
        name: 'Total monthly budget',
      });
      userEvent.clear(directInputTextfield);
      userEvent.type(directInputTextfield, '1234');
      userEvent.click(getByRole('button', { name: 'Cancel' }));

      expect(
        queryByRole('button', { name: 'Use paycheck amount' }),
      ).not.toBeInTheDocument();
      expect(getByText('$10,000')).toBeInTheDocument();
    });

    it('use categories total should update total', async () => {
      const { findByRole, getByText } = render(<TestComponent />);

      userEvent.click(
        await findByRole('button', { name: 'Use categories total' }),
      );

      expect(getByText('$5,000')).toBeInTheDocument();
      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation(
          'UpdateHouseholdDirectInput',
          {
            accountListId,
            id: 'household-family',
            directInput: 5000,
          },
        ),
      );
    });
  });

  describe('left to allocate card', () => {
    it('should display the amount left to allocate', async () => {
      const { findByText, getByRole, getByText } = render(<TestComponent />);

      expect(await findByText('9%')).toBeInTheDocument();

      userEvent.click(getByRole('button', { name: 'Switch to amount' }));

      expect(getByText('$500')).toBeInTheDocument();

      userEvent.click(getByRole('button', { name: 'Switch to percentage' }));

      expect(getByText('9%')).toBeInTheDocument();
    });
  });
});
