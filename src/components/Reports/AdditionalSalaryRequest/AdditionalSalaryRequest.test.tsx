import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { render } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { AsrStatusEnum } from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import { AdditionalSalaryRequest } from './AdditionalSalaryRequest';
import { AdditionalSalaryRequestQuery } from './AdditionalSalaryRequest.generated';
import { AdditionalSalaryRequestProvider } from './Shared/AdditionalSalaryRequestContext';

const accountListId = 'account-list-1';

const mockRequest = {
  id: 'request-1',
  createdAt: '2024-01-01T00:00:00Z',
  status: AsrStatusEnum.InProgress,
  totalAdditionalSalaryRequested: 5000,
  currentYearSalaryNotReceived: 1000,
  previousYearSalaryNotReceived: 500,
  phoneNumber: '555-123-4567',
  feedback: null,
  submittedAt: null,
  approvedAt: null,
  updatedAt: '2024-01-01T00:00:00Z',
  personNumber: '12345',
  additionalSalaryWithinMax: 2000,
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
  traditional403bContributionRequested: 0,
  usingSpouseSalary: false,
  calculations: {
    currentSalaryCap: 50000,
    staffAccountBalance: 10000,
    pendingAsrAmount: 0,
  },
  spouseCalculations: null,
  user: {
    id: 'user-1',
    firstName: 'John',
    lastName: 'Doe',
  },
};

const mockHcmData = {
  hcm: [
    {
      id: 'hcm-1',
      salaryRequestEligible: true,
      asrEit: {
        asrEligibility: true,
      },
      staffInfo: {
        preferredName: 'John',
        emailAddress: 'john.doe@example.com',
        primaryPhoneNumber: '555-123-4567',
      },
    },
  ],
};

interface TestWrapperProps {
  mocks?: {
    AdditionalSalaryRequest?: Partial<AdditionalSalaryRequestQuery>;
  };
  onCall?: jest.Mock;
}

const TestWrapper: React.FC<TestWrapperProps> = ({
  mocks = {},
  onCall = jest.fn(),
}) => {
  const defaultMocks = {
    AdditionalSalaryRequest: {
      latestAdditionalSalaryRequest: mockRequest,
    },
    HcmData: mockHcmData,
    StaffAccountId: {
      user: {
        staffAccountId: 'staff-account-1',
      },
    },
    ...mocks,
  };

  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <I18nextProvider i18n={i18n}>
          <TestRouter
            router={{
              query: {
                accountListId,
              },
            }}
          >
            <GqlMockedProvider mocks={defaultMocks} onCall={onCall}>
              <AdditionalSalaryRequestProvider>
                <AdditionalSalaryRequest />
              </AdditionalSalaryRequestProvider>
            </GqlMockedProvider>
          </TestRouter>
        </I18nextProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

describe('AdditionalSalaryRequest', () => {
  it('renders the Additional Salary Request page title', async () => {
    const { findByText } = render(<TestWrapper />);

    expect(
      await findByText('Your Additional Salary Request'),
    ).toBeInTheDocument();
  });

  it('shows loading skeleton while data is loading', () => {
    const { container } = render(<TestWrapper />);

    // The skeleton should be present initially before data loads
    expect(container.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
  });

  it('displays title when there are no requests', async () => {
    const { findByText, queryByText } = render(
      <TestWrapper
        mocks={{
          AdditionalSalaryRequest: {
            latestAdditionalSalaryRequest: null,
          },
        }}
      />,
    );

    // Title should still be displayed
    expect(
      await findByText('Your Additional Salary Request'),
    ).toBeInTheDocument();
    // No pending request message should be shown
    expect(queryByText(/currently has a pending request/i)).toBeNull();
  });

  it('displays pending request message when status is pending', async () => {
    const pendingRequest = {
      ...mockRequest,
      status: AsrStatusEnum.Pending,
      submittedAt: '2024-01-15T00:00:00Z',
    };

    const { findByText } = render(
      <TestWrapper
        mocks={{
          AdditionalSalaryRequest: {
            latestAdditionalSalaryRequest: pendingRequest,
          },
        }}
      />,
    );

    expect(
      await findByText(/currently has a pending request/i),
    ).toBeInTheDocument();
  });

  it('renders CurrentRequest component for in-progress request', async () => {
    const { findByText } = render(<TestWrapper />);

    expect(await findByText('In Progress')).toBeInTheDocument();
  });

  it('renders CurrentRequest component for pending request', async () => {
    const pendingRequest = {
      ...mockRequest,
      status: AsrStatusEnum.Pending,
      submittedAt: '2024-01-15T00:00:00Z',
    };

    const { findByText } = render(
      <TestWrapper
        mocks={{
          AdditionalSalaryRequest: {
            latestAdditionalSalaryRequest: pendingRequest,
          },
        }}
      />,
    );

    expect(await findByText('Requested on:')).toBeInTheDocument();
  });

  it('renders ApprovedRequest component for approved request', async () => {
    const approvedRequest = {
      ...mockRequest,
      status: AsrStatusEnum.Approved,
      approvedAt: '2024-02-01T00:00:00Z',
    };

    const { findByText } = render(
      <TestWrapper
        mocks={{
          AdditionalSalaryRequest: {
            latestAdditionalSalaryRequest: approvedRequest,
          },
        }}
      />,
    );

    expect(await findByText(/Request processed on:/i)).toBeInTheDocument();
  });

  it('renders action required status with feedback', async () => {
    const actionRequiredRequest = {
      ...mockRequest,
      status: AsrStatusEnum.ActionRequired,
      feedback: 'Please provide additional documentation',
      submittedAt: '2024-01-15T00:00:00Z',
    };

    const { findByText } = render(
      <TestWrapper
        mocks={{
          AdditionalSalaryRequest: {
            latestAdditionalSalaryRequest: actionRequiredRequest,
          },
        }}
      />,
    );

    expect(await findByText('Action Required:')).toBeInTheDocument();
    expect(
      await findByText('Please provide additional documentation'),
    ).toBeInTheDocument();
  });

  it('displays approved request card title for approved status', async () => {
    const approvedRequest = {
      ...mockRequest,
      status: AsrStatusEnum.Approved,
      approvedAt: '2024-02-01T00:00:00Z',
    };

    const { findByText } = render(
      <TestWrapper
        mocks={{
          AdditionalSalaryRequest: {
            latestAdditionalSalaryRequest: approvedRequest,
          },
        }}
      />,
    );

    expect(
      await findByText(/Pending Additional Salary Request/i),
    ).toBeInTheDocument();
  });

  it('displays action required message when request needs action', async () => {
    const actionRequiredRequest = {
      ...mockRequest,
      status: AsrStatusEnum.ActionRequired,
      feedback: 'Need more info',
    };

    const { findByText } = render(
      <TestWrapper
        mocks={{
          AdditionalSalaryRequest: {
            latestAdditionalSalaryRequest: actionRequiredRequest,
          },
        }}
      />,
    );

    expect(
      await findByText(/Action is required to complete your pending request/i),
    ).toBeInTheDocument();
  });

  it('displays pending message when request is pending', async () => {
    const pendingRequest = {
      ...mockRequest,
      status: AsrStatusEnum.Pending,
      submittedAt: '2024-01-15T00:00:00Z',
    };

    const { findByText } = render(
      <TestWrapper
        mocks={{
          AdditionalSalaryRequest: {
            latestAdditionalSalaryRequest: pendingRequest,
          },
        }}
      />,
    );

    expect(
      await findByText(/currently has a pending request/i),
    ).toBeInTheDocument();
  });

  it('displays pending request card for in progress status', async () => {
    const { findByText } = render(<TestWrapper />);

    expect(
      await findByText(/Pending Additional Salary Request/i),
    ).toBeInTheDocument();
  });

  it('renders sidebar with correct title', async () => {
    const { findByLabelText } = render(<TestWrapper />);

    expect(
      await findByLabelText('Additional Salary Request Sections'),
    ).toBeInTheDocument();
  });
});
