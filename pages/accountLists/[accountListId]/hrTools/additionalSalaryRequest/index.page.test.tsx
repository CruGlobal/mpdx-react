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
import {
  UserPreferenceContext,
  UserPreferenceType,
} from 'src/components/User/Preferences/UserPreferenceProvider';
import { UserTypeEnum } from 'src/graphql/types.generated';
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

const defaultContext: UserPreferenceType = {
  locale: 'en-US',
  userType: UserTypeEnum.UsStaff,
};

interface TestComponentProps {
  contextValue: UserPreferenceType;
}

const TestComponent: React.FC<TestComponentProps> = ({ contextValue }) => (
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
          <UserPreferenceContext.Provider value={contextValue}>
            <AdditionalSalaryRequestPage />
          </UserPreferenceContext.Provider>
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
    const { findByRole } = render(
      <TestComponent contextValue={defaultContext} />,
    );

    expect(
      await findByRole('heading', { name: 'About this Form' }),
    ).toBeInTheDocument();
  });

  it('should open and close menu', async () => {
    const { findByRole, getByRole, queryByRole } = render(
      <TestComponent contextValue={defaultContext} />,
    );

    userEvent.click(
      await findByRole('button', { name: 'Toggle HR Tools Menu' }),
    );
    expect(getByRole('heading', { name: 'HR Tools' })).toBeInTheDocument();
    userEvent.click(getByRole('img', { name: 'Close' }));
    expect(
      queryByRole('heading', { name: 'HR Tools' }),
    ).not.toBeInTheDocument();
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

  it('should show limited access if user does not have access to page', async () => {
    const { findByText } = render(
      <TestComponent
        contextValue={{ ...defaultContext, userType: UserTypeEnum.NonCru }}
      />,
    );

    expect(
      await findByText('Access to this feature is limited.'),
    ).toBeInTheDocument();
  });
});
