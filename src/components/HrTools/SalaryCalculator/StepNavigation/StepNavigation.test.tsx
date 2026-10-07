import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AutosaveForm } from 'src/components/Shared/Autosave/AutosaveForm';
import {
  SalaryCalculatorTestWrapper,
  SalaryCalculatorTestWrapperProps,
} from '../SalaryCalculatorTestWrapper';
import { DiscardButton, StepNavigation, SubmitButton } from './StepNavigation';

jest.mock('src/components/Shared/Autosave/AutosaveForm', () => {
  const actual = jest.requireActual<
    typeof import('src/components/Shared/Autosave/AutosaveForm')
  >('src/components/Shared/Autosave/AutosaveForm');
  return {
    ...actual,
    useAutosaveForm: () => ({
      markValid: jest.fn(),
      markInvalid: jest.fn(),
      allValid: true,
    }),
  };
});

const location = 'Chicago, IL';
const mutationSpy = jest.fn();

const TestComponent: React.FC<SalaryCalculatorTestWrapperProps> = (props) => (
  <SalaryCalculatorTestWrapper {...props}>
    <AutosaveForm>
      <StepNavigation />
    </AutosaveForm>
  </SalaryCalculatorTestWrapper>
);

describe('StepNavigation', () => {
  it('renders back and continue buttons in edit mode', async () => {
    const { getByText, findByText } = render(<TestComponent />);
    expect(await findByText('Back')).toBeInTheDocument();
    expect(getByText('Continue')).toBeInTheDocument();
  });

  it('does not render buttons in view mode', async () => {
    const { queryByRole } = render(<TestComponent editing={false} />);

    // Wait for loading to complete
    await waitFor(() =>
      expect(queryByRole('progressbar')).not.toBeInTheDocument(),
    );

    expect(queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();
    expect(queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument();
    expect(queryByRole('button', { name: 'Discard' })).not.toBeInTheDocument();
  });

  it('does not render buttons on the receipt step', async () => {
    const { findByRole, queryByRole } = render(
      <TestComponent onCall={mutationSpy} />,
    );

    userEvent.click(await findByRole('button', { name: 'Continue' }));
    userEvent.click(await findByRole('button', { name: 'Continue' }));
    userEvent.click(await findByRole('button', { name: 'Continue' }));
    userEvent.click(await findByRole('button', { name: 'Submit' }));
    userEvent.click(await findByRole('button', { name: 'Yes, Continue' }));

    await waitFor(() => {
      expect(queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();
    });

    expect(queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument();
    expect(queryByRole('button', { name: 'Submit' })).not.toBeInTheDocument();
    expect(queryByRole('button', { name: 'Discard' })).not.toBeInTheDocument();
  });
});

describe('DiscardButton', () => {
  it('opens discard dialog on click and calls delete mutation', async () => {
    const { findByText } = render(
      <SalaryCalculatorTestWrapper onCall={mutationSpy} editing={true}>
        <DiscardButton />
      </SalaryCalculatorTestWrapper>,
    );
    userEvent.click(await findByText('Discard'));

    userEvent.click(await findByText('Yes, Discard'));
    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('DeleteSalaryCalculation', {
        input: { id: 'salary-request-1' },
      }),
    );
  });

  it('disables the modal buttons and shows a spinner while deleting', async () => {
    const { findByRole, getByRole } = render(
      <SalaryCalculatorTestWrapper onCall={mutationSpy} editing={true}>
        <DiscardButton />
      </SalaryCalculatorTestWrapper>,
    );

    userEvent.click(await findByRole('button', { name: 'Discard' }));

    const confirmButton = await findByRole('button', { name: /yes, discard/i });
    userEvent.click(confirmButton);

    expect(confirmButton).toBeDisabled();
    expect(confirmButton).toHaveAttribute('aria-busy', 'true');
    expect(within(confirmButton).getByRole('progressbar')).toBeInTheDocument();
    expect(getByRole('button', { name: 'GO BACK' })).toBeDisabled();

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('DeleteSalaryCalculation'),
    );
  });
});

describe('StepNavigation split cap validation', () => {
  const exceededSplitCapMock: SalaryCalculatorTestWrapperProps['salaryRequestMock'] =
    {
      splitCapRequired: true,
      manuallySplitCap: true,
      salaryCap: 85000,
      spouseSalaryCap: 85000,
      calculations: { combinedCap: 135000 },
    };

  it('lets the user reach the cap fields, then blocks continuing past them', async () => {
    const { findByRole, getByRole } = render(
      <TestComponent salaryRequestMock={exceededSplitCapMock} />,
    );

    // The Effective Date step comes before the cap fields
    const continueButton = await findByRole('button', { name: 'Continue' });
    expect(continueButton).toBeEnabled();

    userEvent.click(continueButton);

    await waitFor(() =>
      expect(getByRole('button', { name: 'Back' })).toBeEnabled(),
    );
    expect(getByRole('button', { name: 'Continue' })).toBeDisabled();
  });

  it('keeps continue enabled when the split caps fit within the combined cap', async () => {
    const { findByRole, getByRole } = render(
      <TestComponent
        salaryRequestMock={{
          ...exceededSplitCapMock,
          salaryCap: 70000,
          spouseSalaryCap: 65000,
        }}
      />,
    );

    userEvent.click(await findByRole('button', { name: 'Continue' }));

    await waitFor(() =>
      expect(getByRole('button', { name: 'Back' })).toBeEnabled(),
    );
    expect(getByRole('button', { name: 'Continue' })).toBeEnabled();
  });
});

describe('SubmitButton', () => {
  it('submits calculation', async () => {
    const { findByText } = render(
      <SalaryCalculatorTestWrapper onCall={mutationSpy} editing={true}>
        <SubmitButton />
      </SalaryCalculatorTestWrapper>,
    );

    userEvent.click(await findByText('Submit'));
    userEvent.click(await findByText('Yes, Continue'));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('SubmitSalaryCalculation', {
        input: { id: 'salary-request-1' },
      }),
    );
  });

  it('disables the modal buttons and shows a spinner while submitting', async () => {
    const { findByRole, getByRole } = render(
      <SalaryCalculatorTestWrapper onCall={mutationSpy} editing={true}>
        <SubmitButton />
      </SalaryCalculatorTestWrapper>,
    );

    userEvent.click(await findByRole('button', { name: 'Submit' }));

    const confirmButton = await findByRole('button', { name: 'Yes, Continue' });
    userEvent.click(confirmButton);

    expect(confirmButton).toBeDisabled();
    expect(confirmButton).toHaveAttribute('aria-busy', 'true');
    expect(within(confirmButton).getByRole('progressbar')).toBeInTheDocument();

    expect(getByRole('button', { name: 'GO BACK' })).toBeDisabled();

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('SubmitSalaryCalculation'),
    );
  });

  it('updates the account geographic location preference when submitting', async () => {
    const { findByText } = render(
      <SalaryCalculatorTestWrapper
        onCall={mutationSpy}
        editing={true}
        salaryRequestMock={{ location }}
      >
        <SubmitButton />
      </SalaryCalculatorTestWrapper>,
    );

    userEvent.click(await findByText('Submit'));
    userEvent.click(await findByText('Yes, Continue'));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('UpdateAccountPreferences', {
        input: {
          id: 'account-list-1',
          attributes: {
            id: 'account-list-1',
            settings: { geographicLocation: location },
          },
        },
      }),
    );
  });

  it('does not show geographic location info alert when it matches account preferences', async () => {
    const { findByRole, queryByText } = render(
      <SalaryCalculatorTestWrapper
        onCall={mutationSpy}
        editing={true}
        salaryRequestMock={{ location }}
        accountGeographicLocation={location}
      >
        <SubmitButton />
      </SalaryCalculatorTestWrapper>,
    );

    userEvent.click(await findByRole('button', { name: 'Submit' }));

    await findByRole('dialog');
    await waitFor(() =>
      expect(
        queryByText(
          `Your geographic location will be updated as ${location} in your account settings.`,
        ),
      ).not.toBeInTheDocument(),
    );
  });
});
