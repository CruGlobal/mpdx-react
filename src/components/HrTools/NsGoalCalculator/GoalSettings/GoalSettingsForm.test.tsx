import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { gqlMock } from '__tests__/util/graphqlMocking';
import {
  NsGoalCalculatorTestWrapper,
  NsGoalCalculatorTestWrapperProps,
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
    },
  },
});

const TestComponent: React.FC<
  Omit<NsGoalCalculatorTestWrapperProps, 'children'>
> = (props) => (
  <NsGoalCalculatorTestWrapper {...props}>
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
    expect(getAllByRole('spinbutton', { name: 'Dependents' })).toHaveLength(1);
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

  it('shows the spouse column when marital status is set to married, before saving', async () => {
    const { findByRole, getByRole, queryByRole } = render(
      <TestComponent goalCalculationMock={singleMock} />,
    );

    await findByRole('spinbutton', { name: 'Annual Requested Salary — John' });
    expect(
      queryByRole('spinbutton', { name: 'Annual Requested Salary — Spouse' }),
    ).not.toBeInTheDocument();

    fireEvent.mouseDown(getByRole('combobox', { name: 'Marital Status' }));
    fireEvent.click(await findByRole('option', { name: 'Married' }));

    expect(
      await findByRole('spinbutton', {
        name: 'Annual Requested Salary — Spouse',
      }),
    ).toBeInTheDocument();
  });

  it('hides the spouse column when marital status is changed away from married', async () => {
    const { findByRole, getByRole, queryByRole } = render(<TestComponent />);

    await findByRole('spinbutton', { name: 'Annual Requested Salary — Jane' });

    fireEvent.mouseDown(getByRole('combobox', { name: 'Marital Status' }));
    fireEvent.click(await findByRole('option', { name: 'Single' }));

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

  it('saves edits through the updateNewStaffGoalCalculation mutation', async () => {
    const mutationSpy = jest.fn();
    const { findByText, getByText } = render(
      <TestComponent onCall={mutationSpy} />,
    );

    await findByText('Save & Share');
    const form = getByText('Save & Share').closest('form');
    if (!form) {
      throw new Error('Goal settings form not found');
    }
    fireEvent.submit(form);

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
});
