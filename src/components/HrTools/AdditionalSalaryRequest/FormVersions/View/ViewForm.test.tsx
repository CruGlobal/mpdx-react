import {
  AsrStatusEnum,
  ProgressiveApprovalTierReasonEnum,
} from 'src/graphql/types.generated';
import { missingValue } from '../../../Shared/helpers/missingValue';
import { defaultCompleteFormValues } from '../../Shared/CompleteForm.mock';
import {
  combinedCapOverrides,
  combinedCapValues,
  createRenderFormComponent,
  defaultMockContextValue,
  openAvailableBalanceTooltip,
  setupMockContext,
} from '../testUtils';
import { ViewForm } from './ViewForm';

jest.mock('../../Shared/AdditionalSalaryRequestContext', () => {
  const originalModule = jest.requireActual(
    '../../Shared/AdditionalSalaryRequestContext',
  );
  return {
    ...originalModule,
    useAdditionalSalaryRequest: jest.fn(),
  };
});

const mockUseAdditionalSalaryRequest = setupMockContext();
const renderComponent = createRenderFormComponent(
  ViewForm,
  mockUseAdditionalSalaryRequest,
);

// The tier the API gives the viewed request, as when its amount needed approval. Its threshold of $55,000 is above
// the request, as on an approved request whose threshold counts the request itself.
const withApprovalTier = {
  requestData: {
    latestAdditionalSalaryRequest: {
      ...defaultMockContextValue.requestData.latestAdditionalSalaryRequest,
      progressiveApprovalTier: { id: 'tier-1' },
      progressiveApprovalTierReason:
        ProgressiveApprovalTierReasonEnum.OverCombinedCap,
    },
  },
};

describe('ViewForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders page with user info and navigation', () => {
    const { getByText, getByRole } = renderComponent();

    expect(getByText('View Your Request')).toBeInTheDocument();
    expect(getByText('Doe, John')).toBeInTheDocument();

    expect(
      getByRole('button', { name: /back to status/i }),
    ).toBeInTheDocument();
  });

  it('displays financial balances from context', () => {
    const { getByTestId } = renderComponent();

    // availableStaffAccountBalance, not the raw staffAccountBalance of 40000
    expect(getByTestId('amount-one')).toHaveTextContent('$30,000.00');
    // currentSalaryCap: value in the backend
    expect(getByTestId('amount-two')).toHaveTextContent('$100,000.00');
    // remainingAllowableSalary from the API
    expect(getByTestId('amount-three')).toHaveTextContent('$55,000.00');
  });

  // MPDX-10239: the card left a submitted request's own amount out of what was used
  it('shows the remaining salary the API counts for a submitted request', () => {
    const { getByTestId } = renderComponent({
      contextOverrides: {
        requestData: {
          latestAdditionalSalaryRequest: {
            status: AsrStatusEnum.Pending,
            calculations: {
              currentSalaryCap: 100000,
              grossAnnualSalary: 40000,
              ytdAsrAmount: 5000,
              remainingAllowableSalary: 15000,
            },
          },
        },
      },
    });

    expect(getByTestId('amount-three')).toHaveTextContent('$15,000.00');
  });

  it.each([
    { status: AsrStatusEnum.Pending, shown: false },
    { status: AsrStatusEnum.ActionRequired, shown: true },
  ])(
    'with status $status shows the approval note: $shown',
    ({ status, shown }) => {
      const { queryByText } = renderComponent({
        contextOverrides: {
          requestData: {
            latestAdditionalSalaryRequest: {
              ...defaultMockContextValue.requestData
                .latestAdditionalSalaryRequest,
              status,
            },
          },
        },
      });

      expect(!!queryByText(/need approval/)).toBe(shown);
    },
  );

  it('explains the available amount in a tooltip beside its label', async () => {
    const utils = renderComponent();

    expect(utils.queryByText(/Primary balance/)).not.toBeInTheDocument();
    const tooltip = await openAvailableBalanceTooltip(utils);
    expect(tooltip).toHaveTextContent(
      'Primary balance of $40,000.00, minus $10,000.00 in other unpaid requests',
    );
    expect(tooltip).toHaveTextContent(
      "Your spouse's request, waiting for approval: $10,000.00",
    );
  });

  it('shows the approval note inside the card on a request sent back', () => {
    const { getByText, getByTestId } = renderComponent({
      contextOverrides: {
        requestData: {
          latestAdditionalSalaryRequest: {
            ...defaultMockContextValue.requestData
              .latestAdditionalSalaryRequest,
            status: AsrStatusEnum.ActionRequired,
          },
        },
      },
    });

    const note = getByText(
      /Requests over \$55,000\.00 \(your remaining allowable salary\) need approval/,
    );
    expect(note.closest('.MuiCard-root')).toContainElement(
      getByTestId('amount-one'),
    );
  });

  it('handles missing calculations gracefully', () => {
    const { getByTestId } = renderComponent({
      contextOverrides: {
        requestData: {
          latestAdditionalSalaryRequest: {
            calculations: {
              currentSalaryCap: -40000,
            },
          },
        },
        calculations: {
          currentSalaryCap: -40000,
        },
      },
    });

    // availableStaffAccountBalance defaults to 0 when calculations are undefined
    expect(getByTestId('amount-one')).toHaveTextContent('$0.00');
    // currentSalaryCap calculation done in backend
    expect(getByTestId('amount-two')).toHaveTextContent('-$40,000.00');
    // remainingAllowableSalary shows a dash when the API leaves it out
    expect(getByTestId('amount-three')).toHaveTextContent(missingValue);
  });

  it('renders all child components when user exceeds cap', () => {
    const { getByText, getAllByText } = renderComponent({
      initialValues: {
        ...defaultCompleteFormValues,
        additionalSalaryWithinMax: '200000',
      },
      contextOverrides: withApprovalTier,
    });

    expect(
      getByText('Additional Salary Request', {
        selector: '.MuiCardHeader-title',
      }),
    ).toBeInTheDocument();
    expect(
      getByText('403(b) Deduction', { selector: '.MuiCardHeader-title' }),
    ).toBeInTheDocument();
    expect(getAllByText('Net Additional Salary').length).toBeGreaterThanOrEqual(
      1,
    );
    expect(getByText('Contact Information')).toBeInTheDocument();
    expect(getByText('Total Salary Requested')).toBeInTheDocument();
    expect(getByText('Approval Process')).toBeInTheDocument();
  });

  it("shows the approval process by the request's own approval tier, even under the threshold and the own cap", () => {
    const { getByText, queryByText } = renderComponent({
      initialValues: combinedCapValues,
      contextOverrides: withApprovalTier,
    });

    expect(getByText('Approval Process')).toBeInTheDocument();
    expect(queryByText('Total Salary Requested')).not.toBeInTheDocument();
  });

  // An approved or paid request counts itself in its own threshold, so the threshold can't say whether it needed approval
  it("hides the approval process when the request has no approval tier, even past the API's threshold", () => {
    const { queryByText } = renderComponent({
      initialValues: combinedCapValues,
      contextOverrides: combinedCapOverrides,
    });

    expect(queryByText('Approval Process')).not.toBeInTheDocument();
  });

  it('should not render total salary requested or approval process when under cap', () => {
    const { queryByText } = renderComponent();

    expect(queryByText('Total Salary Requested')).not.toBeInTheDocument();
    expect(queryByText('Approval Process')).not.toBeInTheDocument();
  });

  describe('pendingPrint', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('calls window.print and clears the flag when pendingPrint is true', () => {
      const printSpy = jest
        .spyOn(window, 'print')
        .mockImplementation(() => undefined);
      const setPendingPrint = jest.fn();

      renderComponent({
        contextOverrides: {
          pendingPrint: true,
          setPendingPrint,
        },
      });

      // The effect schedules two nested requestAnimationFrame callbacks.
      // Jest's modern fake timers fake rAF (~16ms per frame), so advancing
      // ~32ms flushes both callbacks.
      jest.advanceTimersByTime(32);

      expect(printSpy).toHaveBeenCalledTimes(1);
      expect(setPendingPrint).toHaveBeenCalledWith(false);

      printSpy.mockRestore();
    });

    it('does not call window.print when pendingPrint is false', () => {
      const printSpy = jest
        .spyOn(window, 'print')
        .mockImplementation(() => undefined);

      renderComponent({
        contextOverrides: {
          pendingPrint: false,
        },
      });

      expect(printSpy).not.toHaveBeenCalled();

      printSpy.mockRestore();
    });
  });

  it('handles missing user gracefully', () => {
    const { container } = renderComponent({
      contextOverrides: {
        user: undefined,
      },
    });

    expect(container).toBeInTheDocument();
  });
});
