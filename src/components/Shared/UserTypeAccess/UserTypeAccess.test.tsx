import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { mockSession } from '__tests__/util/mockSession';
import { render } from '__tests__/util/testingLibraryReactMock';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import { UsStaffGroupEnum, UserTypeEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { RequiredUserGroupEnum, UserTypeAccess } from './UserTypeAccess';

const id = 'staff-1';

interface TestComponentProps {
  requiredUserType?: UserTypeEnum;
  requireStaffAccount?: boolean;
  userType?: UserTypeEnum;
  usStaffGroup?: UsStaffGroupEnum;
  staffAccountId?: string | null;
  requireUserGroups?: RequiredUserGroupEnum;
}

const TestComponent: React.FC<TestComponentProps> = ({
  requiredUserType = UserTypeEnum.UsStaff,
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
          requiredUserType={requiredUserType}
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
  afterEach(() => {
    process.env.DEVELOPMENT_ENV = 'false';
  });

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

  it('should render LimitedAccess when user type is allowed but user is ineligible for the NS goal calculator', async () => {
    const { findByRole } = render(
      <TestComponent
        requireUserGroups={RequiredUserGroupEnum.NsGoalCalc}
        usStaffGroup={UsStaffGroupEnum.PartTimeFieldStaff}
      />,
    );
    expect(
      await findByRole('heading', {
        name: 'Access to this feature is limited.',
      }),
    ).toBeInTheDocument();
  });

  it('should render child component when user is eligible for the NS goal calculator', async () => {
    const { findByText } = render(
      <TestComponent
        requireUserGroups={RequiredUserGroupEnum.NsGoalCalc}
        usStaffGroup={UsStaffGroupEnum.NewStaff}
      />,
    );
    expect(await findByText('Test Content')).toBeInTheDocument();
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

  describe('Hybrid staff', () => {
    it('grants a hybrid user access to a us-staff-gated feature', async () => {
      const { findByText } = render(
        <TestComponent userType={UserTypeEnum.HybridStaff} />,
      );
      expect(await findByText('Test Content')).toBeInTheDocument();
    });

    it('grants a hybrid user access to a global-staff-gated feature', async () => {
      const { findByText } = render(
        <TestComponent
          userType={UserTypeEnum.HybridStaff}
          requiredUserType={UserTypeEnum.GlobalStaff}
        />,
      );
      expect(await findByText('Test Content')).toBeInTheDocument();
    });

    it('still gates a hybrid user who has no staff account when a staff account is required', async () => {
      const { findByRole } = render(
        <TestComponent
          userType={UserTypeEnum.HybridStaff}
          requireStaffAccount
          staffAccountId={null}
        />,
      );
      expect(
        await findByRole('heading', {
          name: 'Access to this feature is limited.',
        }),
      ).toBeInTheDocument();
    });

    it('still gates a hybrid user who is ineligible by user group', async () => {
      const { findByRole } = render(
        <TestComponent
          userType={UserTypeEnum.HybridStaff}
          requireUserGroups={RequiredUserGroupEnum.Asr}
          usStaffGroup={UsStaffGroupEnum.PartTimeFieldStaff}
        />,
      );
      expect(
        await findByRole('heading', {
          name: 'Access to this feature is limited.',
        }),
      ).toBeInTheDocument();
    });
  });

  it('should render child component in a development env for a developer even when user is ineligible by group', async () => {
    process.env.DEVELOPMENT_ENV = 'true';
    mockSession({ developer: true });

    const { findByText } = render(
      <TestComponent
        requireUserGroups={RequiredUserGroupEnum.Asr}
        usStaffGroup={UsStaffGroupEnum.PartTimeFieldStaff}
      />,
    );

    expect(await findByText('Test Content')).toBeInTheDocument();
  });

  it('should render child component in a development env for a developer even when user type is not allowed', async () => {
    process.env.DEVELOPMENT_ENV = 'true';
    mockSession({ developer: true });

    const { findByText } = render(
      <TestComponent userType={UserTypeEnum.NonCru} />,
    );

    expect(await findByText('Test Content')).toBeInTheDocument();
  });

  it('should render LimitedAccess in a development env for a developer when staff account is required but not present', async () => {
    process.env.DEVELOPMENT_ENV = 'true';
    mockSession({ developer: true });

    const { findByRole } = render(
      <TestComponent requireStaffAccount staffAccountId={null} />,
    );

    expect(
      await findByRole('heading', {
        name: 'Access to this feature is limited.',
      }),
    ).toBeInTheDocument();
  });

  it('should not bypass eligibility gating in a development env for a non-developer', async () => {
    process.env.DEVELOPMENT_ENV = 'true';
    mockSession({ developer: false });

    const { findByRole } = render(
      <TestComponent userType={UserTypeEnum.NonCru} />,
    );

    expect(
      await findByRole('heading', {
        name: 'Access to this feature is limited.',
      }),
    ).toBeInTheDocument();
  });

  it('should not bypass eligibility gating for a developer outside a development env', async () => {
    process.env.DEVELOPMENT_ENV = 'false';
    mockSession({ developer: true });

    const { findByRole } = render(
      <TestComponent userType={UserTypeEnum.NonCru} />,
    );

    expect(
      await findByRole('heading', {
        name: 'Access to this feature is limited.',
      }),
    ).toBeInTheDocument();
  });
});
