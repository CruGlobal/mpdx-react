import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render } from '__tests__/util/testingLibraryReactMock';
import { StaffAccountQuery } from 'src/components/Reports/StaffAccount.generated';
import {
  UserPreferenceContext,
  UserPreferenceType,
} from 'src/components/User/Preferences/UserPreferenceProvider';
import { UserTypeEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { UserTypeAccess } from './UserTypeAccess';

const mockStaffAccount = {
  StaffAccount: {
    staffAccount: {
      id: '',
      name: 'Test Account',
    },
  },
};

const defaultContext: UserPreferenceType = {
  locale: 'en-US',
  userType: UserTypeEnum.UsStaff,
};

interface TestComponentProps {
  contextValue: UserPreferenceType;
  requireStaffAccount?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  contextValue,
  requireStaffAccount,
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <GqlMockedProvider<{
        StaffAccount: StaffAccountQuery;
      }>
        mocks={mockStaffAccount}
      >
        <UserPreferenceContext.Provider value={contextValue}>
          <UserTypeAccess
            allowedUserType={UserTypeEnum.UsStaff}
            requireStaffAccount={requireStaffAccount}
          >
            <div>Test Content</div>
          </UserTypeAccess>
        </UserPreferenceContext.Provider>
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('UserTypeAccess', () => {
  it('should render child component when user type is allowed', () => {
    const { getByText } = render(
      <TestComponent contextValue={defaultContext} />,
    );
    expect(getByText('Test Content')).toBeInTheDocument();
  });

  it('should render LimitedAccess when user type is not allowed', () => {
    const { getByRole, getByText } = render(
      <TestComponent
        contextValue={{ ...defaultContext, userType: UserTypeEnum.NonCru }}
      />,
    );

    expect(
      getByRole('heading', { name: 'Access to this feature is limited.' }),
    ).toBeInTheDocument();
    expect(
      getByText(
        /our records show that you are not part of the user group that has access to this feature/i,
      ),
    ).toBeInTheDocument();
  });

  it('should render LimitedAccess when staff account is required but not present', async () => {
    const { findByRole, getByText } = render(
      <TestComponent contextValue={defaultContext} requireStaffAccount />,
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

  it('should render LimitedAccess with user group error message when there is an error loading user preferences', () => {
    const { getByRole, getByText } = render(
      <TestComponent
        contextValue={{
          ...defaultContext,
          error: new Error('User group error'),
        }}
      />,
    );

    expect(
      getByRole('heading', { name: 'Unable to load this page' }),
    ).toBeInTheDocument();
    expect(
      getByText(/something went wrong while loading your account information/i),
    ).toBeInTheDocument();
  });
});
