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
      <TestComponent onCall={mutationSpy} />,
    );
    userEvent.click(await findByRole('button', { name: 'Submit' }));
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
      <TestComponent mockPush={mutationSpy} />,
    );
    userEvent.click(await findByRole('button', { name: 'Submit' }));
    const dialog = getByRole('dialog');
    userEvent.click(within(dialog).getByRole('button', { name: 'Submit' }));
    await waitFor(() =>
      expect(mutationSpy).toHaveBeenCalledWith('/accountLists/account-list-1'),
    );
  });

  it('shows a success toast when submitting', async () => {
    const { findByRole, getByRole, findByText } = render(<TestComponent />);
    userEvent.click(await findByRole('button', { name: 'Submit' }));
    userEvent.click(
      within(getByRole('dialog')).getByRole('button', { name: 'Submit' }),
    );

    expect(
      await findByText('Questionnaire submitted successfully.'),
    ).toBeInTheDocument();
  });
});
