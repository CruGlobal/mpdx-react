import { render } from '@testing-library/react';
import { AsrStatusEnum } from 'src/graphql/types.generated';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
import { AvailableBalanceBreakdown } from './AvailableBalanceBreakdown';

jest.mock('../Shared/AdditionalSalaryRequestContext', () => ({
  useAdditionalSalaryRequest: jest.fn(),
}));

const mockUseAdditionalSalaryRequest =
  useAdditionalSalaryRequest as jest.MockedFunction<
    typeof useAdditionalSalaryRequest
  >;

const mockCalculations = (
  calculations: Record<string, unknown> | undefined,
  hcmLoading = false,
) =>
  mockUseAdditionalSalaryRequest.mockReturnValue({
    hcmLoading,
    requestData: {
      latestAdditionalSalaryRequest: { calculations },
    },
  } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

const capFigures = {
  staffAccountBalance: 1500,
  currentSalaryCap: 56750,
  combinedCap: 150000,
  ytdAsrAmount: 0,
};

describe('AvailableBalanceBreakdown', () => {
  it('breaks the available amount into balance, deficit limit, and unpaid requests', () => {
    mockCalculations({
      staffAccountBalance: 1500,
      staffAccountDeficitLimit: 500,
      unpaidHouseholdAsrAmount: 1000,
      unpaidHouseholdAsrs: [
        {
          amount: 800,
          status: AsrStatusEnum.Pending,
          submittedAt: null,
          spouse: true,
        },
        {
          amount: 200,
          status: AsrStatusEnum.ApprovedNotPaid,
          submittedAt: null,
          spouse: false,
        },
      ],
    });

    const { getByText } = render(<AvailableBalanceBreakdown />);

    expect(
      getByText(
        'Primary balance of $1,500.00, plus deficit limit of $500.00, minus $1,000.00 in other unpaid requests',
      ),
    ).toBeInTheDocument();
    expect(
      getByText("Your spouse's request, waiting for approval: $800.00"),
    ).toBeInTheDocument();
    expect(
      getByText('Your request, approved, waiting to be paid: $200.00'),
    ).toBeInTheDocument();
  });

  it('labels a request waiting for changes', () => {
    mockCalculations({
      staffAccountBalance: 1500,
      staffAccountDeficitLimit: 0,
      unpaidHouseholdAsrAmount: 300,
      unpaidHouseholdAsrs: [
        {
          amount: 300,
          status: AsrStatusEnum.ActionRequired,
          submittedAt: null,
          spouse: false,
        },
      ],
    });

    const { getByText } = render(<AvailableBalanceBreakdown />);

    expect(
      getByText('Your request, waiting for changes: $300.00'),
    ).toBeInTheDocument();
  });

  it('leaves out a zero deficit limit and no unpaid requests', () => {
    mockCalculations({
      staffAccountBalance: 1500,
      staffAccountDeficitLimit: 0,
      unpaidHouseholdAsrAmount: 0,
      unpaidHouseholdAsrs: [],
    });

    const { getByText, queryByText, queryByRole } = render(
      <AvailableBalanceBreakdown />,
    );

    expect(getByText('Primary balance of $1,500.00')).toBeInTheDocument();
    expect(queryByText(/deficit limit/)).not.toBeInTheDocument();
    expect(queryByRole('list')).not.toBeInTheDocument();
  });

  it('leaves the approval note to the card above it', () => {
    mockCalculations({
      ...capFigures,
      grossAnnualSalary: 30000,
      remainingAllowableSalary: 26750,
    });

    const { getByText, queryByText } = render(<AvailableBalanceBreakdown />);

    expect(getByText('Primary balance of $1,500.00')).toBeInTheDocument();
    expect(queryByText(/needs? approval/)).not.toBeInTheDocument();
  });

  it('renders nothing without calculations', () => {
    mockCalculations(undefined);

    const { container } = render(<AvailableBalanceBreakdown />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing while HCM data loads', () => {
    mockCalculations({ staffAccountBalance: 1500 }, true);

    const { container } = render(<AvailableBalanceBreakdown />);

    expect(container).toBeEmptyDOMElement();
  });
});
