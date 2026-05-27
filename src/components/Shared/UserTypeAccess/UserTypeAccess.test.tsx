import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render } from '__tests__/util/testingLibraryReactMock';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import { UsStaffGroupEnum, UserTypeEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { RequiredUserGroupEnum, UserTypeAccess } from './UserTypeAccess';

const id = 'staff-1';

interface TestComponentProps {
  requireStaffAccount?: boolean;
  userType?: UserTypeEnum;
  usStaffGroup?: UsStaffGroupEnum;
  staffAccountId?: string | null;
  requireUserGroups?: RequiredUserGroupEnum;
}

const TestComponent: React.FC<TestComponentProps> = ({
  requireStaffAccount,
  userType = UserTypeEnum.UsStaff,
  usStaffGroup = UsStaffGroupEnum.PartTimeFieldStaff,
  staffAccountId = id,
  requireUserGroups,
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <GqlMockedProvider<{
        GetUser: GetUserQuery;
      }>
        mocks={{
          GetUser: { user: { userType, usStaffGroup, staffAccountId } },
        }}
      >
        <UserTypeAccess
          requiredUserType={UserTypeEnum.UsStaff}
          requireStaffAccount={requireStaffAccount}
          requireUserGroups={requireUserGroups}
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

  it('should render LimitedAccess when user type is allowed but user is ineligible for ASR', async () => {
    const { findByRole, getByText } = render(
      <TestComponent
        requireUserGroups={RequiredUserGroupEnum.Asr}
        usStaffGroup={UsStaffGroupEnum.PartTimeFieldStaff}
      />,
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

  it('should render LimitedAccess when user type is allowed but user is ineligible for Salary Calculator', async () => {
    const { findByRole, getByText } = render(
      <TestComponent
        requireUserGroups={RequiredUserGroupEnum.SalaryCalc}
        usStaffGroup={UsStaffGroupEnum.PartTimeFieldStaff}
      />,
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

  it('should render LimitedAccess when user type is allowed but user is ineligible for the MPD goal calculator', async () => {
    const { findByRole } = render(
      <TestComponent
        requireUserGroups={RequiredUserGroupEnum.MpdGoalCalc}
        usStaffGroup={UsStaffGroupEnum.PartTimeFieldStaff}
      />,
    );
    expect(
      await findByRole('heading', {
        name: 'Access to this feature is limited.',
      }),
    ).toBeInTheDocument();
  });

  it('should render LimitedAccess when user type is allowed but user is ineligible for the PDS goal calculator', async () => {
    const { findByRole } = render(
      <TestComponent
        requireUserGroups={RequiredUserGroupEnum.PdsGoalCalc}
        usStaffGroup={UsStaffGroupEnum.PartTimeFieldStaff}
      />,
    );
    expect(
      await findByRole('heading', {
        name: 'Access to this feature is limited.',
      }),
    ).toBeInTheDocument();
  });

  it('should render child component when user is eligible for the PDS goal calculator', async () => {
    const { findByText } = render(
      <TestComponent
        requireUserGroups={RequiredUserGroupEnum.PdsGoalCalc}
        usStaffGroup={UsStaffGroupEnum.PaidWithDesignation}
      />,
    );
    expect(await findByText('Test Content')).toBeInTheDocument();
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
            <UserTypeAccess requiredUserType={UserTypeEnum.UsStaff}>
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
