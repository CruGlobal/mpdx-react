import { act, render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GraphQLError } from 'graphql';
import { SubmitModal } from 'src/components/HrTools/Shared/CalculationReports/SubmitModal/SubmitModal';
import { AutosaveForm } from 'src/components/Shared/Autosave/AutosaveForm';
import {
  SalaryCalculatorTestWrapper,
  SalaryCalculatorTestWrapperProps,
} from '../SalaryCalculatorTestWrapper';
import { DiscardButton, StepNavigation, SubmitButton } from './StepNavigation';

// Delegates to the real modal. A click drops the promise handleConfirm returns, so tests that
// need its rejection call it from the mock's props.
jest.mock(
  'src/components/HrTools/Shared/CalculationReports/SubmitModal/SubmitModal',
  () => {
    const actual = jest.requireActual<
      typeof import('src/components/HrTools/Shared/CalculationReports/SubmitModal/SubmitModal')
    >(
      'src/components/HrTools/Shared/CalculationReports/SubmitModal/SubmitModal',
    );
    return {
      __esModule: true,
      ...actual,
      SubmitModal: jest.fn(actual.SubmitModal),
    };
  },
);

const mockedSubmitModal = SubmitModal as jest.MockedFunction<
  typeof SubmitModal
>;

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
    expect(mutationSpy).not.toHaveGraphqlOperation('SubmitSalaryCalculation', {
      input: { confirmMhaEnd: true },
    });
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
          `Your default location multiplier will be updated to ${location} in your account settings.`,
        ),
      ).not.toBeInTheDocument(),
    );
  });

  describe('when the request would end MHA', () => {
    const jane = {
      personNumber: '100001',
      name: 'Jane Doe',
      reason: 'ZERO_AMOUNT',
      currentTakenAmount: 12000,
    };
    const john = {
      personNumber: '100002',
      name: 'John Doe',
      reason: 'NO_HOUSING_TYPE',
      currentTakenAmount: 7200,
    };
    const mhaWouldEnd = (people: object[]) =>
      new GraphQLError('This request would end MHA', {
        extensions: {
          code: 'MHA_WOULD_END',
          effectiveDate: '2026-11-16',
          people,
        },
      });
    const acknowledgement =
      'I understand that MHA will stop and I still want to submit this request.';
    const janeWarning =
      "Jane Doe won't get MHA starting with the paycheck on 11/25/2026. This request sets their MHA to $0.";

    const renderAndOpenSubmit = async (submitError: GraphQLError) => {
      const utils = render(
        <TestComponent
          onCall={mutationSpy}
          submitError={submitError}
          // A cached date that differs from the error's, so the warning has to use the server's
          salaryRequestMock={{ effectiveDate: '2026-12-01' }}
          payrollDates={[
            { startDate: '2026-11-16', regularProcessDate: '2026-11-25' },
            { startDate: '2026-12-01', regularProcessDate: '2026-12-10' },
          ]}
        />,
      );
      const { findByRole } = utils;
      userEvent.click(await findByRole('button', { name: 'Continue' }));
      userEvent.click(await findByRole('button', { name: 'Continue' }));
      userEvent.click(await findByRole('button', { name: 'Continue' }));
      userEvent.click(await findByRole('button', { name: 'Submit' }));
      return utils;
    };

    const renderAndSubmit = async (submitError: GraphQLError) => {
      const utils = await renderAndOpenSubmit(submitError);
      userEvent.click(
        await utils.findByRole('button', { name: 'Yes, Continue' }),
      );
      return utils;
    };

    it('warns who will stop getting MHA and stays on the submit step', async () => {
      const { findByText, getByRole } = await renderAndSubmit(
        mhaWouldEnd([jane]),
      );

      expect(await findByText(janeWarning)).toBeInTheDocument();
      expect(
        getByRole('heading', {
          name: 'This request will stop MHA. Do you still want to submit it?',
        }),
      ).toBeInTheDocument();

      userEvent.click(getByRole('button', { name: 'GO BACK' }));
      expect(getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });

    it('keeps the global error toast from covering the warning', async () => {
      const { findByText } = await renderAndSubmit(mhaWouldEnd([jane]));

      await findByText(janeWarning);
      const submitCall = mutationSpy.mock.calls.find(
        ([{ operation }]) =>
          operation.operationName === 'SubmitSalaryCalculation',
      );
      expect(submitCall?.[0].operation.getContext().suppressErrorCodes).toEqual(
        ['MHA_WOULD_END'],
      );
    });

    it('keeps confirm disabled until the box is checked', async () => {
      const { findByRole, getByRole } = await renderAndSubmit(
        mhaWouldEnd([jane]),
      );

      const checkbox = await findByRole('checkbox', { name: acknowledgement });
      const confirmButton = getByRole('button', { name: 'Yes, Continue' });
      expect(confirmButton).toBeDisabled();

      userEvent.click(checkbox);
      expect(confirmButton).toBeEnabled();
    });

    it('moves focus from the disabled confirm button to the box', async () => {
      const { findByRole } = await renderAndSubmit(mhaWouldEnd([jane]));

      expect(
        await findByRole('checkbox', { name: acknowledgement }),
      ).toHaveFocus();
    });

    it('resubmits with confirmMhaEnd once confirmed, then advances', async () => {
      const { findByRole, getByRole, queryByText } = await renderAndSubmit(
        mhaWouldEnd([jane]),
      );

      userEvent.click(await findByRole('checkbox', { name: acknowledgement }));
      userEvent.click(getByRole('button', { name: 'Yes, Continue' }));

      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('SubmitSalaryCalculation', {
          input: { id: 'salary-request-1', confirmMhaEnd: true },
        }),
      );
      await waitFor(() => expect(queryByText('Back')).not.toBeInTheDocument());
    });

    it('lists both people when the request ends MHA for both', async () => {
      const { findByText, getByText } = await renderAndSubmit(
        mhaWouldEnd([jane, john]),
      );

      expect(await findByText(janeWarning)).toBeInTheDocument();
      expect(
        getByText(
          "John Doe won't get MHA starting with the paycheck on 11/25/2026. They do not have a current board approval for MHA.",
        ),
      ).toBeInTheDocument();
    });

    it('asks again after the user goes back instead of confirming', async () => {
      const { findByRole, getByRole, queryByRole } = await renderAndSubmit(
        mhaWouldEnd([jane]),
      );

      await findByRole('checkbox', { name: acknowledgement });
      userEvent.click(getByRole('button', { name: 'GO BACK' }));
      userEvent.click(getByRole('button', { name: 'Submit' }));

      expect(
        await findByRole('heading', {
          name: 'Are you ready to submit your Salary Calculation Form?',
        }),
      ).toBeInTheDocument();
      expect(queryByRole('checkbox')).not.toBeInTheDocument();
    });

    it('passes on a submit failure for another reason and shows no MHA warning', async () => {
      const { findByRole, getByRole, queryByRole } = await renderAndOpenSubmit(
        new GraphQLError('Something went wrong', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        }),
      );
      await findByRole('button', { name: 'Yes, Continue' });
      const handleConfirm = mockedSubmitModal.mock.lastCall?.[0].handleConfirm;

      // Rollbar reports unhandled rejections, so the failure must not be swallowed
      await act(async () => {
        await expect(handleConfirm?.()).rejects.toThrow('Something went wrong');
      });
      expect(mutationSpy).toHaveGraphqlOperation('SubmitSalaryCalculation');
      expect(
        getByRole('heading', {
          name: 'Are you ready to submit your Salary Calculation Form?',
        }),
      ).toBeInTheDocument();
      expect(queryByRole('checkbox')).not.toBeInTheDocument();
    });
  });
});
