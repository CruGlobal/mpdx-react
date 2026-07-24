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
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import { UserTypeEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import PartnerRemindersReportPage, { getServerSideProps } from './index.page';

const mutationSpy = jest.fn();

interface ComponentProps {
  userType?: UserTypeEnum;
  staffAccountId?: string | null;
}

const Components: React.FC<ComponentProps> = ({
  userType = UserTypeEnum.UsStaff,
  staffAccountId = '12345',
}) => (
  <ThemeProvider theme={theme}>
    <SnackbarProvider>
      <TestRouter>
        <GqlMockedProvider<{
          GetUser: GetUserQuery;
        }>
          mocks={{
            GetUser: {
              user: { userType, staffAccountId },
            },
          }}
          onCall={mutationSpy}
        >
          <PartnerRemindersReportPage />
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
    const { findByRole } = render(<Components />);

    expect(
      await findByRole('heading', { name: /online reminder system/i }),
    ).toBeInTheDocument();
  });

  it('should open and close menu', async () => {
    const { findByRole, getByRole, queryByRole } = render(<Components />);

    userEvent.click(
      await findByRole('button', { name: 'Toggle Navigation Panel' }),
    );
    expect(getByRole('heading', { name: 'HR Tools' })).toBeInTheDocument();
    userEvent.click(getByRole('img', { name: 'Close' }));
    expect(
      queryByRole('heading', { name: 'HR Tools' }),
    ).not.toBeInTheDocument();
  });

  it('renders even though there is no staff account', async () => {
    const { findByRole } = render(
      <Components userType={UserTypeEnum.UsStaff} staffAccountId={null} />,
    );

    expect(
      await findByRole('heading', { name: /online reminder system/i }),
    ).toBeInTheDocument();
  });

  it('renders limited access page when user group is not US or hybrid staff', async () => {
    const { findByText, getByText } = render(
      <Components userType={UserTypeEnum.GlobalStaff} staffAccountId={null} />,
    );

    expect(
      await findByText(/access to this feature is limited/i),
    ).toBeInTheDocument();
    expect(
      getByText(/our records show that you are not part of the user group/i),
    ).toBeInTheDocument();
  });

  it('uses blockImpersonatingNonDevelopers for server-side props', () => {
    expect(getServerSideProps).toBe(blockImpersonatingNonDevelopers);
  });
});
