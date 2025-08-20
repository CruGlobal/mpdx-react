import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { HouseholdDirectInputQuery } from './HouseholdDirectInput.generated';
import { HouseholdExpensesHeader } from './HouseholdExpensesHeader';

const accountListId = 'account-list-1';
const goalCalculationId = 'goal-calculation-1';
const familyId = 'family-1';
const mutationSpy = jest.fn();

type TestComponentProps = {
  directInput?: number | null;
};

const TestComponent: React.FC<TestComponentProps> = ({
  directInput = null,
}) => (
  <TestRouter
    router={{
      isReady: true,
      query: { accountListId, goalCalculationId },
    }}
  >
    <ThemeProvider theme={theme}>
      <GqlMockedProvider<{ HouseholdDirectInput: HouseholdDirectInputQuery }>
        mocks={{
          HouseholdDirectInput: {
            goalCalculation: {
              householdFamily: {
                id: familyId,
                directInput,
              },
            },
          },
        }}
        onCall={mutationSpy}
      >
        <HouseholdExpensesHeader categoriesTotal={5000} />
      </GqlMockedProvider>
    </ThemeProvider>
  </TestRouter>
);

describe('HouseholdExpensesHeader', () => {
  describe('budgeted card', () => {
    it('should render loading state', async () => {
      const { queryByText, queryByRole } = render(<TestComponent />);

      expect(queryByText('$5,000')).not.toBeInTheDocument();
      expect(
        queryByRole('button', { name: 'Direct input' }),
      ).not.toBeInTheDocument();
      expect(
        queryByRole('button', { name: 'Manual input' }),
      ).not.toBeInTheDocument();

      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('HouseholdDirectInput', {
          accountListId,
          id: goalCalculationId,
        }),
      );
    });

    it('should render categories total when direct input is null', async () => {
      const { findByText } = render(<TestComponent directInput={null} />);

      expect(await findByText('$5,000')).toBeInTheDocument();
    });

    it('should render direct input total when it is set', async () => {
      const { findByText } = render(<TestComponent directInput={6000} />);

      expect(await findByText('$6,000')).toBeInTheDocument();
    });

    it('manual input should update total', async () => {
      const { findByRole, getByText } = render(
        <TestComponent directInput={6000} />,
      );

      userEvent.click(await findByRole('button', { name: 'Manual input' }));

      expect(getByText('$5,000')).toBeInTheDocument();
      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation(
          'UpdateHouseholdDirectInput',
          {
            accountListId,
            id: familyId,
            directInput: null,
          },
        ),
      );
    });

    it('direct input should update total', async () => {
      const { findByRole, getByRole, getByText } = render(<TestComponent />);

      userEvent.click(await findByRole('button', { name: 'Direct input' }));

      const directInputTextfield = getByRole('spinbutton', {
        name: 'Direct input',
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
            id: familyId,
            directInput: 1234,
          },
        ),
      );
    });

    it('cancel should abort setting direct input', async () => {
      const { findByRole, getByRole, getByText, queryByRole } = render(
        <TestComponent />,
      );

      userEvent.click(await findByRole('button', { name: 'Direct input' }));

      const directInputTextfield = getByRole('spinbutton', {
        name: 'Direct input',
      });
      userEvent.clear(directInputTextfield);
      userEvent.type(directInputTextfield, '1234');
      userEvent.click(getByRole('button', { name: 'Cancel' }));

      expect(
        queryByRole('button', { name: 'Manual input' }),
      ).not.toBeInTheDocument();
      expect(getByText('$5,000')).toBeInTheDocument();
    });
  });

  describe('left to allocate card', () => {
    it('should display the amount left to allocate', async () => {
      const { findByText, getByRole, getByText } = render(
        <TestComponent directInput={7500} />,
      );

      expect(await findByText('33%')).toBeInTheDocument();

      userEvent.click(getByRole('button', { name: 'Switch to amount' }));

      expect(getByText('$2,500')).toBeInTheDocument();

      userEvent.click(getByRole('button', { name: 'Switch to percentage' }));

      expect(getByText('33%')).toBeInTheDocument();
    });
  });
});
