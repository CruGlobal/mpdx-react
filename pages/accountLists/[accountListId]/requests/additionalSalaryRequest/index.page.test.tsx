import { ThemeProvider } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render } from '__tests__/util/testingLibraryReactMock';
import {
  afterTestResizeObserver,
  beforeTestResizeObserver,
} from '__tests__/util/windowResizeObserver';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { StaffAccountQuery } from 'src/components/Reports/StaffAccount.generated';
import theme from 'src/theme';
import AdditionalSalaryRequestPage, { getServerSideProps } from './index.page';

const mockStaffAccount = {
  StaffAccount: {
    staffAccount: {
      id: '12345',
      name: 'Test Account',
    },
  },
};

const mockAdditionalSalaryRequests = {
  AdditionalSalaryRequest: {
    latestAdditionalSalaryRequest: null,
  },
};

const mockHcmData = {
  HcmData: {
    hcm: [
      {
        salaryRequestEligible: true,
        asrEit: {
          asrEligibility: true,
        },
        staffInfo: {
          preferredName: 'Test User',
        },
      },
    ],
  },
};

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <SnackbarProvider>
      <TestRouter router={{ query: { accountListId: 'account-list-1' } }}>
        <GqlMockedProvider<{
          StaffAccount: StaffAccountQuery;
        }>
          mocks={{
            ...mockStaffAccount,
            ...mockAdditionalSalaryRequests,
            ...mockHcmData,
          }}
        >
          <AdditionalSalaryRequestPage />
        </GqlMockedProvider>
      </TestRouter>
    </SnackbarProvider>
  </ThemeProvider>
);

describe('AdditionalSalaryRequest page', () => {
  beforeEach(() => {
    beforeTestResizeObserver();
  });

  afterEach(() => {
    afterTestResizeObserver();
  });

  it('uses blockImpersonatingNonDevelopers for server-side props', () => {
    expect(getServerSideProps).toBe(blockImpersonatingNonDevelopers);
  });

  it('renders page', async () => {
    const { findByRole } = render(<TestComponent />);

    expect(
      await findByRole('heading', { name: 'About this Form' }),
    ).toBeInTheDocument();
  });

  it('should open and close menu', async () => {
    const { findByRole, getByRole, queryByRole } = render(<TestComponent />);

    userEvent.click(
      await findByRole('button', { name: 'Toggle Navigation Panel' }),
    );
    expect(getByRole('heading', { name: 'Reports' })).toBeInTheDocument();
    userEvent.click(getByRole('img', { name: 'Close' }));
    expect(queryByRole('heading', { name: 'Reports' })).not.toBeInTheDocument();
  });

  it('renders no staff account page when no staff account', async () => {
    const mockNoStaffAccount = {
      StaffAccount: {
        staffAccount: null,
      },
    };

    const { findByText } = render(
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <TestRouter router={{ query: { accountListId: 'account-list-1' } }}>
            <GqlMockedProvider<{
              StaffAccount: StaffAccountQuery;
            }>
              mocks={mockNoStaffAccount}
            >
              <AdditionalSalaryRequestPage />
            </GqlMockedProvider>
          </TestRouter>
        </SnackbarProvider>
      </ThemeProvider>,
    );

    expect(
      await findByText(/access to this feature is limited/i),
    ).toBeInTheDocument();
  });
});
