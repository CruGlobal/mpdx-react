import { ThemeProvider } from '@emotion/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render } from '__tests__/util/testingLibraryReactMock';
import {
  afterTestResizeObserver,
  beforeTestResizeObserver,
} from '__tests__/util/windowResizeObserver';
import { UserTypeEnum } from 'pages/api/graphql-rest.page.generated';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { StaffAccountQuery } from 'src/components/Reports/StaffAccount.generated';
import {
  UserPreferenceContext,
  UserPreferenceType,
} from 'src/components/User/Preferences/UserPreferenceProvider';
import theme from 'src/theme';
import PartnerRemindersReportPage, { getServerSideProps } from './index.page';

const mutationSpy = jest.fn();

const mockStaffAccount = {
  StaffAccount: {
    staffAccount: {
      id: '12345',
      name: 'Test Account',
    },
  },
};

const defaultContext: UserPreferenceType = {
  locale: 'en-US',
  userType: UserTypeEnum.UsStaff,
};

interface ComponentProps {
  contextValue: UserPreferenceType;
}

const Components: React.FC<ComponentProps> = ({ contextValue }) => (
  <ThemeProvider theme={theme}>
    <SnackbarProvider>
      <TestRouter>
        <GqlMockedProvider<{
          StaffAccount: StaffAccountQuery;
        }>
          mocks={mockStaffAccount}
          onCall={mutationSpy}
        >
          <UserPreferenceContext.Provider value={contextValue}>
            <PartnerRemindersReportPage />
          </UserPreferenceContext.Provider>
        </GqlMockedProvider>
      </TestRouter>
    </SnackbarProvider>
  </ThemeProvider>
);

describe('Partner Reminders Report Page', () => {
  beforeEach(() => {
    beforeTestResizeObserver();
  });

  afterEach(() => {
    afterTestResizeObserver();
  });

  it('should show initial partner reminders report page', async () => {
    const { findByRole } = render(<Components contextValue={defaultContext} />);

    expect(
      await findByRole('heading', { name: /online reminder system/i }),
    ).toBeInTheDocument();
  });

  it('should open and close menu', async () => {
    const { findByRole, getByRole, queryByRole } = render(
      <Components contextValue={defaultContext} />,
    );

    userEvent.click(
      await findByRole('button', { name: 'Toggle Navigation Panel' }),
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
      <TestRouter>
        <GqlMockedProvider<{
          StaffAccount: StaffAccountQuery;
        }>
          mocks={mockNoStaffAccount}
          onCall={mutationSpy}
        >
          <UserPreferenceContext.Provider value={defaultContext}>
            <PartnerRemindersReportPage />
          </UserPreferenceContext.Provider>
        </GqlMockedProvider>
      </TestRouter>,
    );

    expect(
      await findByText(/access to this feature is limited/i),
    ).toBeInTheDocument();
  });

  it('uses blockImpersonatingNonDevelopers for server-side props', () => {
    expect(getServerSideProps).toBe(blockImpersonatingNonDevelopers);
  });

  it('should show limited access if user does not have access to page', async () => {
    const { findByText } = render(
      <Components
        contextValue={{ ...defaultContext, userType: UserTypeEnum.NonCru }}
      />,
    );

    expect(
      await findByText('Access to this feature is limited.'),
    ).toBeInTheDocument();
  });
});
