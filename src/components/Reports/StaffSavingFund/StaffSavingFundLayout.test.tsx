import { ThemeProvider } from '@emotion/react';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render } from '__tests__/util/testingLibraryReactMock';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import { UserTypeEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { StaffAccountQuery } from '../StaffAccount.generated';
import { StaffSavingFundContext } from './StaffSavingFundContext';
import { StaffSavingFundLayout } from './StaffSavingFundLayout';

const title = 'Savings Fund Report';
const id = 'staffSavingFund';

const onNavListToggle = jest.fn();
const mutationSpy = jest.fn();

const mockStaffAccount = {
  StaffAccount: {
    staffAccount: {
      id: '12345',
      name: 'Test Account',
    },
  },
};

const MockStaffSavingFundProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <StaffSavingFundContext.Provider
    value={{
      isNavListOpen: true,
      onNavListToggle: onNavListToggle,
    }}
  >
    {children}
  </StaffSavingFundContext.Provider>
);

interface ComponentProps {
  userType?: UserTypeEnum;
}

const Components: React.FC<ComponentProps> = ({
  userType = UserTypeEnum.UsStaff,
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <GqlMockedProvider<{
        StaffAccount: StaffAccountQuery;
        GetUser: GetUserQuery;
      }>
        mocks={{
          ...mockStaffAccount,
          GetUser: { user: { userType } },
        }}
        onCall={mutationSpy}
      >
        <MockStaffSavingFundProvider>
          <StaffSavingFundLayout pageTitle={title} selectedMenuId={id}>
            <div>Test Children</div>
          </StaffSavingFundLayout>
        </MockStaffSavingFundProvider>
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('StaffSavingFundLayout', () => {
  it('renders children with staff account', async () => {
    const { findByText } = render(<Components />);
    expect(await findByText('Test Children')).toBeInTheDocument();
  });

  it('should open nav list', async () => {
    const { findByText } = render(<Components />);
    expect(await findByText(/salary calculator/i)).toBeInTheDocument();
    expect(await findByText(/hr tools/i)).toBeInTheDocument();
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
          <MockStaffSavingFundProvider>
            <StaffSavingFundLayout pageTitle={title} selectedMenuId={id}>
              <div>Test Children</div>
            </StaffSavingFundLayout>
          </MockStaffSavingFundProvider>
        </GqlMockedProvider>
      </TestRouter>,
    );
    expect(
      await findByText(/access to this feature is limited/i),
    ).toBeInTheDocument();
  });

  it('should show limited access if user does not have access to page', async () => {
    const { findByText } = render(
      <Components userType={UserTypeEnum.NonCru} />,
    );

    expect(
      await findByText('Access to this feature is limited.'),
    ).toBeInTheDocument();
  });
});
