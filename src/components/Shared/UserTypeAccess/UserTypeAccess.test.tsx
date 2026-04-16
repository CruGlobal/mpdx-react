import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render } from '__tests__/util/testingLibraryReactMock';
import { StaffAccountQuery } from 'src/components/Reports/StaffAccount.generated';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import { UserTypeEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { UserTypeAccess } from './UserTypeAccess';

const id = 'staff-1';

interface TestComponentProps {
  requireStaffAccount?: boolean;
  userType?: UserTypeEnum;
  staffAccountId?: string | null;
}

const TestComponent: React.FC<TestComponentProps> = ({
  requireStaffAccount,
  userType = UserTypeEnum.UsStaff,
  staffAccountId = id,
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <GqlMockedProvider<{
        StaffAccount: StaffAccountQuery;
        GetUser: GetUserQuery;
      }>
        mocks={{
          GetUser: { user: { userType } },
          StaffAccount: {
            staffAccount: staffAccountId
              ? { id: staffAccountId, name: 'Test Account' }
              : null,
          },
        }}
      >
        <UserTypeAccess
          allowedUserType={UserTypeEnum.UsStaff}
          requireStaffAccount={requireStaffAccount}
        >
          <div>Test Content</div>
        </UserTypeAccess>
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('UserTypeAccess', () => {
  it('should render child component when user type is allowed', async () => {
    const { findByText } = render(<TestComponent />);
    expect(await findByText('Test Content')).toBeInTheDocument();
  });

  it('should render LimitedAccess when user type is not allowed', async () => {
    const { findByRole, getByText } = render(
      <TestComponent userType={UserTypeEnum.NonCru} />,
    );

    expect(
      await findByRole('heading', {
        name: 'Access to this feature is limited.',
      }),
    ).toBeInTheDocument();
    expect(
      getByText(
        /our records show that you are not part of the user group that has access to this feature/i,
      ),
    ).toBeInTheDocument();
  });

  it('should render LimitedAccess when staff account is required but not present', async () => {
    const { findByRole, getByText } = render(
      <TestComponent requireStaffAccount staffAccountId={null} />,
    );

    expect(
      await findByRole('heading', {
        name: 'Access to this feature is limited.',
      }),
    ).toBeInTheDocument();
    expect(
      getByText(/our records show that you do not have a staff account/i),
    ).toBeInTheDocument();
  });

  it('should render child component when staff account is required and present', async () => {
    const { findByText } = render(
      <TestComponent requireStaffAccount staffAccountId={id} />,
    );
    expect(await findByText('Test Content')).toBeInTheDocument();
  });

  it('should render LimitedAccess with user group error message when there is an error loading the user', async () => {
    const { findByRole, getByText } = render(
      <ThemeProvider theme={theme}>
        <TestRouter>
          <GqlMockedProvider
            mocks={{
              GetUser: {
                user: () => {
                  throw new Error('User group error');
                },
              },
            }}
          >
            <UserTypeAccess allowedUserType={UserTypeEnum.UsStaff}>
              <div>Test Content</div>
            </UserTypeAccess>
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );

    expect(
      await findByRole('heading', { name: 'Unable to load this page' }),
    ).toBeInTheDocument();
    expect(
      getByText(/something went wrong while loading your account information/i),
    ).toBeInTheDocument();
  });

  it('should render LimitedAccess with user error when there is an error loading the staff account', async () => {
    const { findByRole, getByText } = render(
      <ThemeProvider theme={theme}>
        <TestRouter>
          <GqlMockedProvider
            mocks={{
              GetUser: { user: { userType: UserTypeEnum.UsStaff } },
              StaffAccount: {
                staffAccount: () => {
                  throw new Error('Staff account error');
                },
              },
            }}
          >
            <UserTypeAccess requireStaffAccount>
              <div>Test Content</div>
            </UserTypeAccess>
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );

    expect(
      await findByRole('heading', { name: 'Unable to load this page' }),
    ).toBeInTheDocument();
    expect(
      getByText(/something went wrong while loading your account information/i),
    ).toBeInTheDocument();
  });
});
