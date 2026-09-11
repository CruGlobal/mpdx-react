import { ThemeProvider } from '@emotion/react';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
import MPGAReportPage, { getServerSideProps } from './index.page';

const mutationSpy = jest.fn();
const id = '1000000001';

interface ComponentProps {
  userType?: UserTypeEnum;
  staffAccountId?: string | null;
  supervisesStaff?: boolean;
  viewedStaffAccountId?: string;
}

const Components = ({
  userType = UserTypeEnum.UsStaff,
  staffAccountId = '12345',
  supervisesStaff = false,
  viewedStaffAccountId,
}: ComponentProps) => (
  <ThemeProvider theme={theme}>
    <TestRouter
      router={{
        query: {
          accountListId: 'account-list-1',
          ...(viewedStaffAccountId && {
            staffAccountId: viewedStaffAccountId,
          }),
        },
      }}
    >
      <GqlMockedProvider<{
        GetUser: GetUserQuery;
      }>
        mocks={{
          GetUser: { user: { userType, staffAccountId, supervisesStaff } },
        }}
        onCall={mutationSpy}
      >
        <MPGAReportPage />
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('MPGA Report Page', () => {
  beforeEach(() => {
    beforeTestResizeObserver();
  });

  afterEach(() => {
    afterTestResizeObserver();
  });

  it('uses blockImpersonatingNonDevelopers for server-side props', () => {
    expect(getServerSideProps).toBe(blockImpersonatingNonDevelopers);
  });

  it('should show initial mpga report page', async () => {
    const { findByText } = render(<Components />);

    expect(
      await findByText(/ministry partner giving analysis/i),
    ).toBeInTheDocument();
  });

  it('should open and close  menu', async () => {
    const { findByRole, getByRole, queryByRole } = render(<Components />);

    userEvent.click(
      await findByRole('button', { name: 'Toggle Navigation Panel' }),
    );
    expect(getByRole('heading', { name: 'Reports' })).toBeInTheDocument();
    userEvent.click(getByRole('img', { name: 'Close' }));
    expect(queryByRole('heading', { name: 'Reports' })).not.toBeInTheDocument();
  });

  it('renders no staff account page when no staff account', async () => {
    const mockNoStaffAccount = {
      GetUser: {
        user: {
          staffAccountId: null,
        },
      },
    };

    const { findByText } = render(
      <TestRouter>
        <GqlMockedProvider<{
          GetUser: GetUserQuery;
        }>
          mocks={mockNoStaffAccount}
          onCall={mutationSpy}
        >
          <MPGAReportPage />
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

  describe('supervisor view', () => {
    it('lets a supervisor without their own staff account view a staff report', async () => {
      const { findByText } = render(
        <Components
          staffAccountId={null}
          supervisesStaff
          viewedStaffAccountId={id}
        />,
      );

      expect(
        await findByText(/ministry partner giving analysis/i),
      ).toBeInTheDocument();
    });

    it('blocks a non-supervisor from viewing another staff report', async () => {
      const { findByText } = render(
        <Components supervisesStaff={false} viewedStaffAccountId={id} />,
      );

      expect(
        await findByText(/you do not supervise any staff/i),
      ).toBeInTheDocument();
    });

    it('passes the staff account from the url into the report query', async () => {
      render(<Components supervisesStaff viewedStaffAccountId={id} />);

      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('MPGATransactions', {
          staffAccountId: id,
        }),
      );
    });
  });
});
