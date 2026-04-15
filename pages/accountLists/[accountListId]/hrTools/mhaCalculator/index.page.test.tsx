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
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { StaffAccountQuery } from 'src/components/Reports/StaffAccount.generated';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import { UserTypeEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import MinisterHousingAllowancePage, { getServerSideProps } from './index.page';

const mutationSpy = jest.fn();

const mocks = {
  StaffAccount: {
    staffAccount: {
      id: '12345',
      name: 'Test Account',
    },
  },
};
interface ComponentProps {
  userType?: UserTypeEnum;
}

const Components: React.FC<ComponentProps> = ({
  userType = UserTypeEnum.UsStaff,
}) => (
  <ThemeProvider theme={theme}>
    <SnackbarProvider>
      <TestRouter>
        <GqlMockedProvider<{
          StaffAccount: StaffAccountQuery;
          GetUser: GetUserQuery;
        }>
          mocks={{
            ...mocks,
            GetUser: {
              user: { userType },
            },
          }}
          onCall={mutationSpy}
        >
          <MinisterHousingAllowancePage />
        </GqlMockedProvider>
      </TestRouter>
    </SnackbarProvider>
  </ThemeProvider>
);

describe('MHA Calculation Page', () => {
  beforeEach(() => {
    beforeTestResizeObserver();
  });

  afterEach(() => {
    afterTestResizeObserver();
  });

  it('uses blockImpersonatingNonDevelopers for server-side props', () => {
    expect(getServerSideProps).toBe(blockImpersonatingNonDevelopers);
  });

  it('should show initial MHA calculation page', async () => {
    const { findAllByRole } = render(<Components />);

    const heading = await findAllByRole('heading', { name: /your mha/i });
    expect(heading[0]).toBeInTheDocument();
  });

  it('should open and close menu', async () => {
    const { findByRole, getByRole, queryByRole } = render(<Components />);

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
      <TestRouter>
        <GqlMockedProvider<{
          StaffAccount: StaffAccountQuery;
        }>
          mocks={mockNoStaffAccount}
          onCall={mutationSpy}
        >
          <MinisterHousingAllowancePage />
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
