import { render } from '@testing-library/react';
import { AsrStatusEnum } from 'src/graphql/types.generated';
import { AdditionalSalaryRequestQuery } from '../AdditionalSalaryRequest.generated';
import { AdditionalSalaryRequestSectionEnum } from '../AdditionalSalaryRequestHelper';
import { AdditionalSalaryRequestTestWrapper } from '../AdditionalSalaryRequestTestWrapper';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
import { ApprovedRequest } from './ApprovedRequest';

type RequestType = NonNullable<
  AdditionalSalaryRequestQuery['latestAdditionalSalaryRequest']
>;

jest.mock('../Shared/AdditionalSalaryRequestContext', () => ({
  ...jest.requireActual('../Shared/AdditionalSalaryRequestContext'),
  useAdditionalSalaryRequest: jest.fn(),
}));

const mockUseAdditionalSalaryRequest =
  useAdditionalSalaryRequest as jest.MockedFunction<
    typeof useAdditionalSalaryRequest
  >;

const mockRequest: RequestType = {
  id: 'request-123',
  createdAt: '2025-06-01T00:00:00.000Z',
  totalAdditionalSalaryRequested: 5000,
  usingSpouseSalary: false,
  approvedAt: '2025-06-15T00:00:00.000Z',
  currentYearSalaryNotReceived: 1000,
  previousYearSalaryNotReceived: 500,
  additionalSalaryWithinMax: 200,
  adoption: 0,
  traditional403bContribution: 0,
  roth403bContribution: 0,
  counselingNonMedical: 0,
  healthcareExpensesExceedingLimit: 0,
  babysittingMinistryEvents: 0,
  childrenMinistryTripExpenses: 0,
  childrenCollegeEducation: 0,
  movingExpense: 0,
  seminary: 0,
  housingDownPayment: 0,
  autoPurchase: 0,
  expensesNotApprovedWithin90Days: 0,
  deductTaxDeferredPercent: false,
  phoneNumber: '123-456-7890',
  personNumber: 'person-123',
  updatedAt: '2025-06-15T00:00:00.000Z',
  status: AsrStatusEnum.Approved,
  feedback: null,
  traditional403bContributionRequested: 0,
  submittedAt: null,
  calculations: {
    currentSalaryCap: 50000,
    staffAccountBalance: 10000,
    predictedYearIncome: 45000,
    pendingAsrAmount: 0,
    maxAmountAndReason: {
      amount: 10000,
      reason: 'Test reason',
    },
  },
  spouseCalculations: null,
  user: {
    id: 'user-1',
    firstName: 'John',
    lastName: 'Doe',
  },
};

const mockContextValue = {
  staffAccountId: 'staff-1',
  staffAccountIdLoading: false,
  steps: [],
  currentIndex: 0,
  currentStep: AdditionalSalaryRequestSectionEnum.AboutForm,
  handleNextStep: jest.fn(),
  handlePreviousStep: jest.fn(),
  isDrawerOpen: false,
  toggleDrawer: jest.fn(),
  requestData: null,
  loading: false,
  requestError: undefined,
  pageType: undefined,
  handleDeleteRequest: jest.fn(),
  requestId: undefined,
  user: {
    staffInfo: {
      preferredName: 'John',
    },
  } as never,
  spouse: {
    staffInfo: {
      preferredName: 'Jane',
    },
  } as never,
  salaryInfo: undefined,
  isInternational: false,
  isMutating: false,
  trackMutation: jest.fn(),
  remainingAllowableSalary: 0,
  traditional403bPercentage: 0,
};

const TestComponent: React.FC<{ request: RequestType }> = ({ request }) => (
  <AdditionalSalaryRequestTestWrapper>
    <ApprovedRequest request={request} />
  </AdditionalSalaryRequestTestWrapper>
);

describe('ApprovedRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAdditionalSalaryRequest.mockReturnValue(mockContextValue);
  });

  it('renders the approved request card', () => {
    const { getByText } = render(<TestComponent request={mockRequest} />);

    expect(
      getByText("John's Approved Additional Salary Request"),
    ).toBeInTheDocument();
  });

  it('displays the approval date', () => {
    const { getByText } = render(<TestComponent request={mockRequest} />);

    expect(getByText(/APPROVAL DATE/)).toBeInTheDocument();
    expect(getByText(/6\/15\/2025/)).toBeInTheDocument();
  });

  it('displays the total additional salary requested', () => {
    const { getByText } = render(<TestComponent request={mockRequest} />);

    expect(getByText('$5,000.00')).toBeInTheDocument();
  });

  it('displays the user preferred name', () => {
    const { getByText } = render(<TestComponent request={mockRequest} />);

    expect(getByText('John')).toBeInTheDocument();
  });

  it('displays spouse name when usingSpouseSalary is true', () => {
    const requestWithSpouse = { ...mockRequest, usingSpouseSalary: true };

    const { getByText } = render(<TestComponent request={requestWithSpouse} />);

    expect(getByText('Jane')).toBeInTheDocument();
  });

  it('does not display spouse name when usingSpouseSalary is false', () => {
    const { queryByText } = render(<TestComponent request={mockRequest} />);

    expect(queryByText('Jane')).not.toBeInTheDocument();
  });

  it('renders links for viewing and duplicating request', () => {
    const { getByText } = render(<TestComponent request={mockRequest} />);

    expect(getByText('View Current ASR')).toBeInTheDocument();
    expect(getByText("Duplicate Last Year's ASR")).toBeInTheDocument();
  });

  it('shows skeleton when approvedAt is not provided', () => {
    const requestWithoutApproval: RequestType = {
      ...mockRequest,
      approvedAt: null,
    };

    const { container } = render(
      <TestComponent request={requestWithoutApproval} />,
    );

    expect(container.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
  });
});
