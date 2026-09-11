import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { waitFor } from '@testing-library/react';
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
import { StaffExpenseReportPage, getServerSideProps } from './index.page';

const mutationSpy = jest.fn();
const id = '1000000001';

interface ComponentProps {
  userType?: UserTypeEnum;
  staffAccountId?: string | null;
  supervisesStaff?: boolean;
  viewedStaffAccountId?: string;
}

const Components = ({
  userType = UserTypeEnum.NonCru,
  staffAccountId = '12345',
  supervisesStaff = false,
  viewedStaffAccountId,
}: ComponentProps = {}) => (
  <ThemeProvider theme={theme}>
    <SnackbarProvider>
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <TestRouter
          router={{
            isReady: true,
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
            <StaffExpenseReportPage />
          </GqlMockedProvider>
        </TestRouter>
      </LocalizationProvider>
    </SnackbarProvider>
  </ThemeProvider>
);

describe('StaffExpense page', () => {
  beforeEach(() => {
    mutationSpy.mockClear();
    beforeTestResizeObserver();
  });

  afterEach(() => {
    afterTestResizeObserver();
  });

  it('uses blockImpersonatingNonDevelopers for server-side props', () => {
    expect(getServerSideProps).toBe(blockImpersonatingNonDevelopers);
  });

  it('should show limited access if user does not have access to page', async () => {
    const { findByText } = render(<Components />);

    expect(
      await findByText('Access to this feature is limited.'),
    ).toBeInTheDocument();
  });

  describe('supervisor view', () => {
    it('lets a supervisor without their own staff account view a staff report', async () => {
      const { findByRole } = render(
        <Components
          userType={UserTypeEnum.UsStaff}
          staffAccountId={null}
          supervisesStaff
          viewedStaffAccountId={id}
        />,
      );

      expect(
        await findByRole('heading', { name: 'Staff Expense Report' }),
      ).toBeInTheDocument();
    });

    it('blocks a non-supervisor from viewing another staff report', async () => {
      const { findByText } = render(
        <Components
          userType={UserTypeEnum.UsStaff}
          supervisesStaff={false}
          viewedStaffAccountId={id}
        />,
      );

      expect(
        await findByText(/you do not supervise any staff/i),
      ).toBeInTheDocument();
    });

    it('passes the staff account from the url into the report query', async () => {
      render(
        <Components
          userType={UserTypeEnum.UsStaff}
          supervisesStaff
          viewedStaffAccountId={id}
        />,
      );

      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('ReportsStaffExpenses', {
          staffAccountId: id,
        }),
      );
    });
  });
});
