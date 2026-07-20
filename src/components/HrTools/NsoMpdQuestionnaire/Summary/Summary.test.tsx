import { waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '__tests__/util/testingLibraryReactMock';
import {
  NewStaffQuestionnaireMaritalStatusEnum,
  NewStaffQuestionnaireVariantEnum,
} from 'src/graphql/types.generated';
import {
  NsoMpdQuestionnaireTestWrapper,
  NsoMpdQuestionnaireTestWrapperProps,
} from '../NsoMpdQuestionnaireTestWrapper';
import { Summary } from './Summary';

const mutationSpy = jest.fn();

const filledDebtFields = {
  studentLoanMonthlyPayment: 0,
  carLoanMonthlyPayment: 0,
  creditCardDebtMonthlyPayment: 0,
};

const TestComponent: React.FC<
  Omit<NsoMpdQuestionnaireTestWrapperProps, 'children'>
> = (props) => (
  <NsoMpdQuestionnaireTestWrapper {...props}>
    <Summary />
  </NsoMpdQuestionnaireTestWrapper>
);

describe('Summary', () => {
  it('renders the four section titles', async () => {
    const { findByRole, getByRole } = render(<TestComponent />);
    expect(
      await findByRole('heading', { level: 6, name: 'Personal Information' }),
    ).toBeInTheDocument();
    expect(
      getByRole('heading', { level: 6, name: 'Ministry Information' }),
    ).toBeInTheDocument();
    expect(
      getByRole('heading', { level: 6, name: 'Financial Information' }),
    ).toBeInTheDocument();
    expect(
      getByRole('heading', { level: 6, name: 'NSO Information' }),
    ).toBeInTheDocument();
  });

  it('shows SpouseSeniorStaff variant financial rows', async () => {
    const { findByRole } = render(
      <TestComponent
        newStaffQuestionnaire={{
          variant: NewStaffQuestionnaireVariantEnum.SpouseSeniorStaff,
          spouseMhaAmount: 1200,
        }}
      />,
    );
    expect(
      await findByRole('rowheader', { name: "Spouse's requested MHA" }),
    ).toBeInTheDocument();
  });

  it('omits spouse rows for a single staff member', async () => {
    const { findByRole, queryByRole } = render(
      <TestComponent
        hasSpouse={false}
        newStaffQuestionnaire={{
          maritalStatus: NewStaffQuestionnaireMaritalStatusEnum.Single,
          spouseFirstName: null,
          spouseAge: null,
          spouseTenure: null,
        }}
      />,
    );
    await findByRole('heading', { level: 6, name: 'Personal Information' });
    expect(
      queryByRole('rowheader', { name: 'Spouse name' }),
    ).not.toBeInTheDocument();
  });

  it('shows the spouse cell phone for a married staff member', async () => {
    const { findByRole, getByRole } = render(
      <TestComponent
        newStaffQuestionnaire={{ spousePhoneNumber: '(305) 222-3333' }}
      />,
    );
    expect(
      await findByRole('rowheader', { name: 'Spouse cell phone' }),
    ).toBeInTheDocument();
    expect(getByRole('cell', { name: '(305) 222-3333' })).toBeInTheDocument();
  });

  it('omits the spouse cell phone for a single staff member', async () => {
    const { findByRole, queryByRole } = render(
      <TestComponent
        hasSpouse={false}
        newStaffQuestionnaire={{
          maritalStatus: NewStaffQuestionnaireMaritalStatusEnum.Single,
        }}
      />,
    );
    await findByRole('heading', { level: 6, name: 'Personal Information' });
    expect(
      queryByRole('rowheader', { name: 'Spouse cell phone' }),
    ).not.toBeInTheDocument();
  });

  it('lists unanswered fields with a placeholder', async () => {
    const { findByRole, getAllByRole } = render(
      <TestComponent newStaffQuestionnaire={{ carLoanMonthlyPayment: null }} />,
    );
    expect(
      await findByRole('rowheader', { name: 'Car loan monthly payment' }),
    ).toBeInTheDocument();
    expect(
      getAllByRole('cell', { name: 'No value provided' }).length,
    ).toBeGreaterThan(0);
  });

  it('hides variant-only financial rows for the single/married variant', async () => {
    const { findByRole, queryByRole } = render(
      <TestComponent
        newStaffQuestionnaire={{
          variant: NewStaffQuestionnaireVariantEnum.SingleMarried,
        }}
      />,
    );
    await findByRole('heading', { level: 6, name: 'Financial Information' });
    expect(
      queryByRole('rowheader', { name: 'Healthcare dependents' }),
    ).not.toBeInTheDocument();
  });

  it('shows the healthcare dependents row only for the sosa variant', async () => {
    const { findByRole } = render(
      <TestComponent
        newStaffQuestionnaire={{
          variant: NewStaffQuestionnaireVariantEnum.Sosa,
        }}
      />,
    );
    expect(
      await findByRole('rowheader', { name: 'Healthcare dependents' }),
    ).toBeInTheDocument();
  });

  it('renders a Back button', async () => {
    const { findByRole } = render(<TestComponent />);

    expect(await findByRole('button', { name: 'Back' })).toBeInTheDocument();
  });

  it('submits via the confirmation modal', async () => {
    const { findByRole, getByRole } = render(
      <TestComponent
        onCall={mutationSpy}
        newStaffQuestionnaire={filledDebtFields}
      />,
    );
    const submitButton = await findByRole('button', { name: 'Submit' });
    await waitFor(() => expect(submitButton).toBeEnabled());
    userEvent.click(submitButton);
    const dialog = getByRole('dialog');
    userEvent.click(within(dialog).getByRole('button', { name: 'Submit' }));
    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation(
        'CompleteNewStaffQuestionnaire',
        { input: { accountListId: 'account-list-1' } },
      ),
    );
  });

  it('redirects to the dashboard after submitting', async () => {
    const { findByRole, getByRole } = render(
      <TestComponent
        mockPush={mutationSpy}
        newStaffQuestionnaire={filledDebtFields}
      />,
    );
    const submitButton = await findByRole('button', { name: 'Submit' });
    await waitFor(() => expect(submitButton).toBeEnabled());
    userEvent.click(submitButton);
    const dialog = getByRole('dialog');
    userEvent.click(within(dialog).getByRole('button', { name: 'Submit' }));
    await waitFor(() =>
      expect(mutationSpy).toHaveBeenCalledWith('/accountLists/account-list-1'),
    );
  });

  it('shows a success toast when submitting', async () => {
    const { findByRole, getByRole, findByText } = render(
      <TestComponent newStaffQuestionnaire={filledDebtFields} />,
    );
    const submitButton = await findByRole('button', { name: 'Submit' });
    await waitFor(() => expect(submitButton).toBeEnabled());
    userEvent.click(submitButton);
    userEvent.click(
      within(getByRole('dialog')).getByRole('button', { name: 'Submit' }),
    );

    expect(
      await findByText('Questionnaire submitted successfully.'),
    ).toBeInTheDocument();
  });

  it('disables Submit and warns when required fields are missing', async () => {
    const { findByRole, getByRole } = render(<TestComponent />);

    expect(await findByRole('alert')).toHaveTextContent(
      'Your form is missing information.',
    );
    expect(getByRole('button', { name: 'Submit' })).toBeDisabled();
  });

  it('links only the incomplete sections in the warning', async () => {
    const { findByRole, queryByRole } = render(<TestComponent />);

    expect(
      await findByRole('button', { name: 'Financial Information' }),
    ).toBeInTheDocument();

    // Completed sections are filtered out of the warning once the data loads.
    await waitFor(() =>
      expect(
        queryByRole('button', { name: 'Ministry Information' }),
      ).not.toBeInTheDocument(),
    );
    expect(
      queryByRole('button', { name: 'NSO Information' }),
    ).not.toBeInTheDocument();
    expect(
      queryByRole('button', { name: 'Personal Information' }),
    ).not.toBeInTheDocument();
  });

  it('enables Submit and hides the warning when the form is complete', async () => {
    const { findByRole, queryByRole } = render(
      <TestComponent newStaffQuestionnaire={filledDebtFields} />,
    );

    const submitButton = await findByRole('button', { name: 'Submit' });
    await waitFor(() => expect(submitButton).toBeEnabled());
    expect(queryByRole('alert')).not.toBeInTheDocument();
  });
});
