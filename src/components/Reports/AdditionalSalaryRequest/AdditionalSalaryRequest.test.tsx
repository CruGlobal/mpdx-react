import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

const mutationSpy = jest.fn();
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
  deductTwelvePercent: false,
  traditional403bContributionRequested: 0,
  usingSpouseSalary: false,
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

const mockHcmData = {
  hcm: [
    {
      id: 'hcm-1',
      salaryRequestEligible: true,
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

  it('renders the Create New ASR button', async () => {
    const { findByRole } = render(<TestWrapper />);

    expect(
      await findByRole('button', { name: 'Create New ASR' }),
    ).toBeInTheDocument();
  });

  it('shows loading skeleton while data is loading', () => {
    const { container } = render(<TestWrapper />);

    // The skeleton should be present initially before data loads
    expect(container.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
  });

  it('displays no request message when there are no requests', async () => {
    const { findByText } = render(
      <TestWrapper
        mocks={{
          AdditionalSalaryRequest: {
            latestAdditionalSalaryRequest: null,
          },
        }}
      />,
    );

    expect(
      await findByText(/No Additional Salary Request has been created yet/i),
    ).toBeInTheDocument();
  });

  it('displays pending request message when there is a request', async () => {
    const { findByText } = render(<TestWrapper />);

    expect(
      await findByText(/currently has an Additional Salary Request/i),
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

    expect(await findByText(/APPROVAL DATE/i)).toBeInTheDocument();
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

  it('calls createAdditionalSalaryRequest mutation when Create New ASR is clicked', async () => {
    const mutationSpy = jest.fn();

    const { findByRole } = render(<TestWrapper onCall={mutationSpy} />);

    const createButton = await findByRole('button', { name: 'Create New ASR' });
    userEvent.click(createButton);

    await waitFor(() => {
      expect(mutationSpy).toHaveBeenCalled();
    });
  });

  it('shows success snackbar after creating ASR request', async () => {
    const { findByRole, findByText } = render(
      <TestWrapper
        mocks={{
          AdditionalSalaryRequest: {
            latestAdditionalSalaryRequest: null,
          },
        }}
      />,
    );

    const createButton = await findByRole('button', { name: 'Create New ASR' });
    userEvent.click(createButton);

    expect(
      await findByText(/Successfully created ASR Request/i),
    ).toBeInTheDocument();
  });

  it('determines allRequestStatus as Approved when there is an approved request', async () => {
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

    expect(await findByText(/status of Approved/i)).toBeInTheDocument();
  });

  it('determines allRequestStatus as Action Required when request needs action', async () => {
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

    expect(await findByText(/status of Action Required/i)).toBeInTheDocument();
  });

  it('determines allRequestStatus as Pending when request is pending', async () => {
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

    expect(await findByText(/status of Pending/i)).toBeInTheDocument();
  });

  it('determines allRequestStatus as In Progress when request is in progress', async () => {
    const { findByText } = render(<TestWrapper />);

    expect(await findByText(/status of In Progress/i)).toBeInTheDocument();
  });

  it('renders sidebar with correct title', async () => {
    const { findByLabelText } = render(<TestWrapper />);

    expect(
      await findByLabelText('Additional Salary Request Sections'),
    ).toBeInTheDocument();
  });

  it('creates a request with hcm phone and email', async () => {
    const { findByRole, findByText } = render(
      <TestWrapper onCall={mutationSpy} />,
    );

    await findByText(/John currently has/i);

    const createButton = await findByRole('button', { name: 'Create New ASR' });
    userEvent.click(createButton);

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation(
        'CreateAdditionalSalaryRequest',
        {
          attributes: {
            emailAddress: 'john.doe@example.com',
            phoneNumber: '555-123-4567',
          },
        },
      );
    });
  });
});
