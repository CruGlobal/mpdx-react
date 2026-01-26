import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AsrStatusEnum } from 'src/graphql/types.generated';
import { AdditionalSalaryRequestsQuery } from '../AdditionalSalaryRequest.generated';
import { AdditionalSalaryRequestSectionEnum } from '../AdditionalSalaryRequestHelper';
import { AdditionalSalaryRequestTestWrapper } from '../AdditionalSalaryRequestTestWrapper';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
import { CurrentRequest } from './CurrentRequest';

type RequestType =
  AdditionalSalaryRequestsQuery['additionalSalaryRequests']['nodes'][0];

jest.mock('../Shared/AdditionalSalaryRequestContext', () => ({
  ...jest.requireActual('../Shared/AdditionalSalaryRequestContext'),
  useAdditionalSalaryRequest: jest.fn(),
}));

const mockUseAdditionalSalaryRequest =
  useAdditionalSalaryRequest as jest.MockedFunction<
    typeof useAdditionalSalaryRequest
  >;

const mockHandleDeleteRequest = jest.fn();

const mockRequest: RequestType = {
  id: 'request-123',
  totalAdditionalSalaryRequested: 5000,
  usingSpouseSalary: false,
  approvedAt: null,
  submittedAt: '2025-06-10T00:00:00.000Z',
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
  deductTwelvePercent: false,
  phoneNumber: '123-456-7890',
  personNumber: 'person-123',
  updatedAt: '2025-06-15T00:00:00.000Z',
  status: AsrStatusEnum.Pending,
  feedback: null,
  traditional403bContributionRequested: 0,
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
  steps: [],
  currentIndex: 0,
  currentStep: AdditionalSalaryRequestSectionEnum.AboutForm,
  handleNextStep: jest.fn(),
  handlePreviousStep: jest.fn(),
  isDrawerOpen: false,
  toggleDrawer: jest.fn(),
  requestsData: null,
  requestData: null,
  requestsError: undefined,
  pageType: undefined,
  handleDeleteRequest: mockHandleDeleteRequest,
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
  isMutating: false,
  trackMutation: jest.fn(),
};

const TestComponent: React.FC<{ request: RequestType }> = ({ request }) => (
  <AdditionalSalaryRequestTestWrapper>
    <CurrentRequest request={request} />
  </AdditionalSalaryRequestTestWrapper>
);

describe('CurrentRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAdditionalSalaryRequest.mockReturnValue(mockContextValue);
  });

  it('renders the pending request card with user name', () => {
    const { getByText } = render(<TestComponent request={mockRequest} />);

    expect(
      getByText("John's Pending Additional Salary Request"),
    ).toBeInTheDocument();
  });

  it('displays the total additional salary requested', () => {
    const { getByText } = render(<TestComponent request={mockRequest} />);

    expect(getByText('$5,000.00')).toBeInTheDocument();
  });

  it('renders View Request and Edit Request links', () => {
    const { getByText } = render(<TestComponent request={mockRequest} />);

    expect(getByText('View Request')).toBeInTheDocument();
    expect(getByText('Edit Request')).toBeInTheDocument();
  });

  describe('timeline status - InProgress', () => {
    it('displays "In Progress" for in progress requests', () => {
      const inProgressRequest: RequestType = {
        ...mockRequest,
        status: AsrStatusEnum.InProgress,
        submittedAt: null,
      };

      const { getByText } = render(
        <TestComponent request={inProgressRequest} />,
      );

      expect(getByText('In Progress')).toBeInTheDocument();
    });
  });

  describe('timeline status - Pending', () => {
    it('displays "Requested on:" with date for submitted requests', () => {
      const pendingRequest: RequestType = {
        ...mockRequest,
        status: AsrStatusEnum.Pending,
        submittedAt: '2025-06-10T00:00:00.000Z',
      };

      const { getByText } = render(<TestComponent request={pendingRequest} />);

      expect(getByText('Requested on:')).toBeInTheDocument();
    });

    it('displays "Request In Process" for pending status', () => {
      const pendingRequest: RequestType = {
        ...mockRequest,
        status: AsrStatusEnum.Pending,
      };

      const { getByText } = render(<TestComponent request={pendingRequest} />);

      expect(getByText('Request In Process')).toBeInTheDocument();
    });
  });

  describe('timeline status - Approved', () => {
    it('displays "Request processed on:" for approved requests', () => {
      const approvedRequest: RequestType = {
        ...mockRequest,
        status: AsrStatusEnum.Approved,
        submittedAt: '2025-06-10T00:00:00.000Z',
      };

      const { getByText } = render(<TestComponent request={approvedRequest} />);

      expect(getByText('Request processed on:')).toBeInTheDocument();
    });

    it('displays "Request Complete" for approved status', () => {
      const approvedRequest: RequestType = {
        ...mockRequest,
        status: AsrStatusEnum.Approved,
      };

      const { getByText } = render(<TestComponent request={approvedRequest} />);

      expect(getByText('Request Complete')).toBeInTheDocument();
    });
  });

  describe('timeline status - ActionRequired', () => {
    it('displays "Action Required:" with feedback', () => {
      const actionRequiredRequest: RequestType = {
        ...mockRequest,
        status: AsrStatusEnum.ActionRequired,
        feedback: 'Please provide additional documentation',
      };

      const { getByText } = render(
        <TestComponent request={actionRequiredRequest} />,
      );

      expect(getByText('Action Required:')).toBeInTheDocument();
      expect(
        getByText('Please provide additional documentation'),
      ).toBeInTheDocument();
    });

    it('displays "Request processed on:" for action required status', () => {
      const actionRequiredRequest: RequestType = {
        ...mockRequest,
        status: AsrStatusEnum.ActionRequired,
        submittedAt: '2025-06-10T00:00:00.000Z',
      };

      const { getByText } = render(
        <TestComponent request={actionRequiredRequest} />,
      );

      expect(getByText('Request processed on:')).toBeInTheDocument();
    });
  });

  it('calls handleDeleteRequest when cancel is confirmed', async () => {
    const { getAllByRole, getByRole } = render(
      <TestComponent request={mockRequest} />,
    );

    const cancelButtons = getAllByRole('button', { name: /cancel request/i });
    // Get the actual cancel button (not the CardActionArea wrapper)
    const cancelButton = cancelButtons.find((btn) =>
      btn.classList.contains('MuiButton-text'),
    );
    userEvent.click(cancelButton!);

    const confirmButton = getByRole('button', { name: /yes, cancel/i });
    userEvent.click(confirmButton);

    expect(mockHandleDeleteRequest).toHaveBeenCalledWith('request-123');
  });
});
