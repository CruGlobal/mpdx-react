import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider, gqlMock } from '__tests__/util/graphqlMocking';
import { NewStaffQuestionnaireMaritalStatusEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import {
  NsGoalCalculatorTestWrapper,
  NsGoalCalculatorTestWrapperProps,
  defaultGoalCalculation,
} from '../NsGoalCalculatorTestWrapper';
import { GoalSettingsForm } from './GoalSettingsForm';
import {
  NewStaffGoalCalculationDocument,
  NewStaffGoalCalculationQuery,
  NewStaffGoalCalculationQueryVariables,
} from './NewStaffGoalCalculation.generated';

const accountListId = 'account-list-1';

const singleMock = gqlMock<
  NewStaffGoalCalculationQuery,
  NewStaffGoalCalculationQueryVariables
>(NewStaffGoalCalculationDocument, {
  variables: { accountListId },
  mocks: {
    newStaffGoalCalculation: {
      id: 'goal-calculation-1',
      firstName: 'John',
      lastName: 'Doe',
      spouseFirstName: null,
      maritalStatus: NewStaffQuestionnaireMaritalStatusEnum.Single,
    },
  },
});

const mutationSpy = jest.fn();

const TestComponent: React.FC<
  Omit<NsGoalCalculatorTestWrapperProps, 'children'>
> = (props) => (
  <NsGoalCalculatorTestWrapper onCall={mutationSpy} {...props}>
    <GoalSettingsForm accountListId={accountListId} />
  </NsGoalCalculatorTestWrapper>
);

describe('GoalSettingsForm', () => {
  it('renders all six section headings', async () => {
    const { findByRole, getByRole } = render(<TestComponent />);

    expect(
      await findByRole('heading', { name: 'Personal Information' }),
    ).toBeInTheDocument();
    expect(
      getByRole('heading', { name: 'Financial Information' }),
    ).toBeInTheDocument();
    expect(
      getByRole('heading', { name: 'Healthcare Information' }),
    ).toBeInTheDocument();
    expect(
      getByRole('heading', { name: 'Ministry Information' }),
    ).toBeInTheDocument();
    expect(
      getByRole('heading', { name: 'NSO Information' }),
    ).toBeInTheDocument();
    expect(
      getByRole('heading', { name: 'Exemptions & Exceptions' }),
    ).toBeInTheDocument();
  });

  it('renders Cancel and Save & Share actions', async () => {
    const { findByRole, getByRole } = render(<TestComponent />);

    expect(await findByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Save & Share' })).toBeInTheDocument();
  });

  it('renders a single shared input for household-level fields', async () => {
    const { findByRole, getAllByRole } = render(<TestComponent />);

    await findByRole('heading', { name: 'Personal Information' });
    expect(
      getAllByRole('spinbutton', { name: 'Healthcare Dependents' }),
    ).toHaveLength(1);
    expect(getAllByRole('combobox', { name: 'Marital Status' })).toHaveLength(
      1,
    );
  });

  it('renders a per-person input for both the staff member and spouse', async () => {
    const { findByRole, getByRole } = render(<TestComponent />);

    expect(
      await findByRole('spinbutton', {
        name: 'Annual Requested Salary — John',
      }),
    ).toBeInTheDocument();
    expect(
      getByRole('spinbutton', { name: 'Annual Requested Salary — Jane' }),
    ).toBeInTheDocument();
  });

  it('hides spouse inputs when there is no spouse', async () => {
    const { findByRole, queryByRole } = render(
      <TestComponent goalCalculationMock={singleMock} />,
    );

    expect(
      await findByRole('spinbutton', {
        name: 'Annual Requested Salary — John',
      }),
    ).toBeInTheDocument();
    expect(
      queryByRole('spinbutton', { name: 'Annual Requested Salary — Jane' }),
    ).not.toBeInTheDocument();
  });

  it('shows the calculated 403(b) contribution amount for each person', async () => {
    const { findByText, getByText } = render(
      <TestComponent
        goalCalculationMock={{
          newStaffGoalCalculation: {
            ...defaultGoalCalculation,
            calculations: {
              ...defaultGoalCalculation.calculations,
              contributing403bAmount: 600,
              spouseContributing403bAmount: 390,
            },
          },
        }}
      />,
    );

    // The label lives in a visually-hidden span so screen readers announce the
    // owner; its parent <p> holds the label + the formatted amount.
    expect(
      (await findByText('403(b) Amount — John')).parentElement,
    ).toHaveTextContent('$600.00');
    expect(getByText('403(b) Amount — Jane').parentElement).toHaveTextContent(
      '$390.00',
    );
  });

  it('hides the spouse 403(b) amount when there is no spouse', async () => {
    const { findByText, queryByText } = render(
      <TestComponent goalCalculationMock={singleMock} />,
    );

    expect(await findByText('403(b) Amount — John')).toBeInTheDocument();
    expect(queryByText('403(b) Amount — Spouse')).not.toBeInTheDocument();
  });

  it('shows the spouse column when marital status is set to married, before saving', async () => {
    const { findByRole, getByRole, queryByRole } = render(
      <TestComponent goalCalculationMock={singleMock} />,
    );

    await findByRole('spinbutton', { name: 'Annual Requested Salary — John' });
    expect(
      queryByRole('spinbutton', { name: 'Annual Requested Salary — Spouse' }),
    ).not.toBeInTheDocument();

    userEvent.click(getByRole('combobox', { name: 'Marital Status' }));
    userEvent.click(await findByRole('option', { name: 'Married' }));

    expect(
      await findByRole('spinbutton', {
        name: 'Annual Requested Salary — Spouse',
      }),
    ).toBeInTheDocument();
  });

  it('hides the spouse column when marital status is changed away from married', async () => {
    const { findByRole, getByRole, queryByRole } = render(<TestComponent />);

    await findByRole('spinbutton', { name: 'Annual Requested Salary — Jane' });

    userEvent.click(getByRole('combobox', { name: 'Marital Status' }));
    userEvent.click(await findByRole('option', { name: 'Single' }));

    await waitFor(() =>
      expect(
        queryByRole('spinbutton', { name: 'Annual Requested Salary — Jane' }),
      ).not.toBeInTheDocument(),
    );
  });

  it('shows a message when no calculation exists yet', async () => {
    const { findByText } = render(
      <TestComponent goalCalculationMock={{ newStaffGoalCalculation: null }} />,
    );

    expect(
      await findByText(
        'No new staff goal calculation exists for this account.',
      ),
    ).toBeInTheDocument();
  });

  it('shows an error message when the calculation query fails', async () => {
    const { findByRole, queryByText } = render(
      <ThemeProvider theme={theme}>
        <TestRouter>
          <GqlMockedProvider<{
            NewStaffGoalCalculation: NewStaffGoalCalculationQuery;
          }>
            mocks={
              {
                NewStaffGoalCalculation: {
                  newStaffGoalCalculation: () => {
                    throw new Error('Failed to load calculation');
                  },
                },
              } as ApolloErgonoMockMap
            }
          >
            <GoalSettingsForm accountListId={accountListId} />
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );

    expect(await findByRole('alert')).toHaveTextContent(
      'Failed to load calculation',
    );
    expect(
      queryByText('No new staff goal calculation exists for this account.'),
    ).not.toBeInTheDocument();
  });

  it('saves edits through the updateNewStaffGoalCalculation mutation', async () => {
    const { findByRole } = render(<TestComponent onCall={mutationSpy} />);

    const saveButton = await findByRole('button', { name: 'Save & Share' });
    await waitFor(() => expect(saveButton).toBeEnabled());
    userEvent.click(saveButton);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation(
        'UpdateNewStaffGoalCalculation',
        {
          input: {
            accountListId,
            id: 'goal-calculation-1',
          },
        },
      ),
    );
  });

  it('sends edited field values through to the mutation attributes', async () => {
    const { findByRole, getByRole } = render(<TestComponent />);

    const salary = await findByRole('spinbutton', {
      name: 'Annual Requested Salary — John',
    });
    userEvent.clear(salary);
    userEvent.type(salary, '54321');

    userEvent.click(getByRole('button', { name: 'Save & Share' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation(
        'UpdateNewStaffGoalCalculation',
        {
          input: {
            accountListId,
            id: 'goal-calculation-1',
            attributes: { annualRequestedSalary: 54321 },
          },
        },
      ),
    );
  });

  it('clears spouse attributes when marital status changes from married to single', async () => {
    const { findByRole, getByRole } = render(<TestComponent />);

    userEvent.click(await findByRole('combobox', { name: 'Marital Status' }));
    userEvent.click(getByRole('option', { name: 'Single' }));
    userEvent.click(getByRole('button', { name: 'Save & Share' }));

    // Every spouse attribute is sent as null so the save doesn't persist stale
    // spouse data for someone who is no longer married.
    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation(
        'UpdateNewStaffGoalCalculation',
        {
          input: {
            accountListId,
            id: 'goal-calculation-1',
            attributes: {
              maritalStatus: NewStaffQuestionnaireMaritalStatusEnum.Single,
              spouseJoining: null,
              spouseAge: null,
              spouseTenure: null,
              spouseRequestedAnnualSalary: null,
              spouseContribution403bPercentage: null,
              spouseMhaAmount: null,
              spouseHealthcareExempt: null,
              spouseSecaExempt: null,
            },
          },
        },
      ),
    );
  });

  it('shows a spinner on the save button while submitting', async () => {
    const { findByRole } = render(<TestComponent onCall={jest.fn()} />);

    const saveButton = await findByRole('button', { name: 'Save & Share' });
    await waitFor(() => expect(saveButton).toBeEnabled());
    userEvent.click(saveButton);

    // The button stays disabled with a spinner until the save resolves.
    expect(await findByRole('progressbar')).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });

  it('blocks submit and flags the field for an invalid value', async () => {
    const { findByRole } = render(<TestComponent />);

    const contribution = await findByRole('spinbutton', {
      name: '403(b) Contribution — John',
    });
    userEvent.clear(contribution);
    userEvent.type(contribution, '9999');
    userEvent.tab();

    await waitFor(() => expect(contribution).toBeInvalid());
    expect(mutationSpy).not.toHaveGraphqlOperation(
      'UpdateNewStaffGoalCalculation',
    );
  });

  it('disables Save & Share while the form is invalid', async () => {
    const { findByRole, getByRole } = render(<TestComponent />);

    const saveButton = await findByRole('button', { name: 'Save & Share' });
    expect(saveButton).toBeEnabled();

    const contribution = getByRole('spinbutton', {
      name: '403(b) Contribution — John',
    });
    userEvent.clear(contribution);
    userEvent.type(contribution, '9999');

    await waitFor(() => expect(saveButton).toBeDisabled());

    userEvent.clear(contribution);
    userEvent.type(contribution, '5');

    await waitFor(() => expect(saveButton).toBeEnabled());
  });

  it('discards edits when Cancel is clicked', async () => {
    const { findByRole, getByRole } = render(<TestComponent />);

    const salary = await findByRole('spinbutton', {
      name: 'Annual Requested Salary — John',
    });
    userEvent.clear(salary);
    userEvent.type(salary, '12345');
    expect(salary).toHaveValue(12345);

    userEvent.click(getByRole('button', { name: 'Cancel' }));

    await waitFor(() => expect(salary).not.toHaveValue(12345));
  });

  it('renders a loading skeleton before the calculation resolves', async () => {
    const { container, findByRole, queryByRole } = render(<TestComponent />);

    // While loading: the skeleton shows and the form is not yet rendered.
    expect(container.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
    expect(
      queryByRole('button', { name: 'Save & Share' }),
    ).not.toBeInTheDocument();

    // Once the query resolves, the form replaces the skeleton.
    expect(
      await findByRole('button', { name: 'Save & Share' }),
    ).toBeInTheDocument();
  });
});
