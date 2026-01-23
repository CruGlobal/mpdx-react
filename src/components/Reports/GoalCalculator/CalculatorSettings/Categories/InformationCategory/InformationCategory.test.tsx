import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import {
  GoalCalculationAge,
  MpdGoalBenefitsConstantSizeEnum,
} from 'src/graphql/types.generated';
import { GoalCalculatorConstantsQuery } from 'src/hooks/goalCalculatorConstants.generated';
import i18n from 'src/lib/i18n';
import {
  GoalCalculatorTestWrapper,
  constantsMock,
  goalCalculationMock,
} from '../../../GoalCalculatorTestWrapper';
import { GoalCalculationQuery } from '../../../Shared/GoalCalculation.generated';
import { InformationCategory } from './InformationCategory';

const mutationSpy = jest.fn();

interface TestComponentProps {
  single?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({ single = false }) => (
  <GqlMockedProvider<{
    GoalCalculation: GoalCalculationQuery;
    GoalCalculatorConstants: GoalCalculatorConstantsQuery;
    GetUser: GetUserQuery;
  }>
    mocks={{
      GoalCalculation: {
        goalCalculation: {
          ...goalCalculationMock,
          familySize: single
            ? MpdGoalBenefitsConstantSizeEnum.Single
            : MpdGoalBenefitsConstantSizeEnum.MarriedNoChildren,
        },
      },
      GoalCalculatorConstants: {
        constant: constantsMock,
      },
      GetUser: {
        user: {
          avatar: 'avatar.jpg',
        },
      },
    }}
    onCall={mutationSpy}
  >
    <I18nextProvider i18n={i18n}>
      <GoalCalculatorTestWrapper noMocks>
        <InformationCategory />
      </GoalCalculatorTestWrapper>
    </I18nextProvider>
  </GqlMockedProvider>
);

describe('InformationCategory', () => {
  it('toggles to spouse information when button is clicked', async () => {
    const { findByRole, queryByTestId, getByTestId, queryByText, getByText } =
      render(<TestComponent />);

    expect(queryByTestId('spouse-information-form')).not.toBeInTheDocument();
    expect(
      queryByText(/spouse's personal information/i),
    ).not.toBeInTheDocument();
    expect(
      queryByText(/spouse's financial information/i),
    ).not.toBeInTheDocument();

    userEvent.click(await findByRole('button', { name: 'View Jane' }));

    expect(getByTestId('spouse-information-form')).toBeInTheDocument();
    expect(getByText(/spouse's personal information/i)).toBeInTheDocument();
    expect(getByText(/spouse's financial information/i)).toBeInTheDocument();
  });

  it('shows user information by default', () => {
    const { getByTestId, getByText } = render(<TestComponent />);

    expect(getByTestId('user-information-form')).toBeInTheDocument();
    expect(getByText(/personal information/i)).toBeInTheDocument();
    expect(getByText(/financial information/i)).toBeInTheDocument();
  });

  it('hides view spouse button if the user has no spouse', async () => {
    const { getByRole, queryByRole } = render(<TestComponent single />);

    await waitFor(() =>
      expect(getByRole('textbox', { name: 'First Name' })).toHaveValue('John'),
    );

    expect(
      queryByRole('button', { name: 'View Jane' }),
    ).not.toBeInTheDocument();
  });

  it("renders the user's first name", async () => {
    const { getByTestId } = render(<TestComponent />);
    await waitFor(() => {
      expect(getByTestId('info-name-typography')).toHaveTextContent('John');
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
              id: 'goal-calculation-1',
              firstName: 'Jack',
            },
          },
        }),
      );
    });

    it('clears invalid benefits plan', async () => {
      const { getByRole } = render(<TestComponent />);

      const input = getByRole('combobox', { name: 'Family Size' });
      await waitFor(() =>
        expect(input).toHaveTextContent('Married with no children'),
      );

      userEvent.click(input);
      userEvent.click(
        getByRole('option', { name: 'Married with 1-2 children' }),
      );

      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('UpdateGoalCalculation', {
          input: {
            accountListId: 'account-list-1',
            attributes: {
              id: 'goal-calculation-1',
              benefitsPlan: null,
            },
          },
        }),
      );
    });

    it('updates the spouse MHA amount', async () => {
      const { getByRole, findByRole } = render(<TestComponent />);

      userEvent.click(await findByRole('button', { name: 'View Jane' }));
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
              id: 'goal-calculation-1',
              spouseMhaAmount: 750,
            },
          },
        }),
      );
    });

    it('updates the years on staff', async () => {
      const { getByRole } = render(<TestComponent />);

      const input = getByRole('combobox', { name: 'Years on Staff' });
      await waitFor(() => expect(input).toHaveTextContent('10-14'));
      userEvent.click(input);
      userEvent.click(getByRole('option', { name: '5-9' }));

      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('UpdateGoalCalculation', {
          input: {
            accountListId: 'account-list-1',
            attributes: {
              id: 'goal-calculation-1',
              yearsOnStaff: 5,
            },
          },
        }),
      );
    });

    it('updates the age', async () => {
      const { getByRole } = render(<TestComponent />);

      const input = getByRole('combobox', { name: 'Age' });
      await waitFor(() => expect(input).toHaveTextContent('30-34'));
      userEvent.click(input);
      userEvent.click(getByRole('option', { name: 'Under 30' }));

      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('UpdateGoalCalculation', {
          input: {
            accountListId: 'account-list-1',
            attributes: {
              id: 'goal-calculation-1',
              age: GoalCalculationAge.UnderThirty,
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

      userEvent.click(getByRole('button', { name: 'View Jane' }));
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
              id: 'goal-calculation-1',
              spouseSecaExempt: true,
            },
          },
        }),
      );
    });

    it('sets field to null when input is empty', async () => {
      const { getByRole } = render(<TestComponent />);

      const input = getByRole('spinbutton', {
        name: 'MHA Amount Per Paycheck',
      });
      await waitFor(() => expect(input).toHaveValue(1000));

      userEvent.clear(input);
      input.blur();

      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('UpdateGoalCalculation', {
          input: {
            accountListId: 'account-list-1',
            attributes: {
              id: 'goal-calculation-1',
              mhaAmount: null,
            },
          },
        }),
      );
    });

    it('shows errors and does not save when input is invalid', async () => {
      const { getByRole } = render(<TestComponent />);

      const input = getByRole('spinbutton', {
        name: 'MHA Amount Per Paycheck',
      });
      await waitFor(() => expect(input).toHaveValue(1000));

      userEvent.clear(input);
      userEvent.type(input, '-1000');
      input.blur();

      expect(input).toHaveAccessibleDescription(
        'MHA Amount Per Paycheck must be positive',
      );

      await waitFor(() =>
        expect(mutationSpy).not.toHaveGraphqlOperation('UpdateGoalCalculation'),
      );
    });
  });
});
