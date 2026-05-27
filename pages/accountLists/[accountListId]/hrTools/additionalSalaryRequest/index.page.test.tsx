import { ThemeProvider } from '@mui/material/styles';
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
import { HcmQuery } from 'src/components/HrTools/Shared/HcmData/Hcm.generated';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import { UsStaffGroupEnum, UserTypeEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import AdditionalSalaryRequestPage, { getServerSideProps } from './index.page';

interface TestComponentProps {
  userType?: UserTypeEnum;
  usStaffGroup?: UsStaffGroupEnum.SeniorStaff;
  staffAccountId?: string;
}

const TestComponent: React.FC<TestComponentProps> = ({
  userType = UserTypeEnum.UsStaff,
  usStaffGroup = UsStaffGroupEnum.SeniorStaff,
  staffAccountId = 'account-list-1',
}) => (
  <ThemeProvider theme={theme}>
    <SnackbarProvider>
      <TestRouter router={{ query: { accountListId: 'account-list-1' } }}>
        <GqlMockedProvider<{
          GetUser: GetUserQuery;
          Hcm: HcmQuery;
        }>
          mocks={{
            GetUser: {
              user: { userType, usStaffGroup, staffAccountId },
            },
            Hcm: {
              hcm: [
                {
                  asrEit: {
                    asrEligibility: true,
                  },
                },
              ],
            },
          }}
        >
          <AdditionalSalaryRequestPage />
        </GqlMockedProvider>
      </TestRouter>
    </SnackbarProvider>
  </ThemeProvider>
);

describe('AdditionalSalaryRequest page', () => {
  beforeEach(() => {
    beforeTestResizeObserver();
  });

  afterEach(() => {
    afterTestResizeObserver();
  });

  it('uses blockImpersonatingNonDevelopers for server-side props', () => {
    expect(getServerSideProps).toBe(blockImpersonatingNonDevelopers);
  });

  it('renders page', async () => {
    const { findByRole } = render(<TestComponent />);

    expect(
      await findByRole('heading', { name: 'About this Form' }),
    ).toBeInTheDocument();
  });

  it('should open and close menu', async () => {
    const { findByRole, getByRole, queryByRole } = render(<TestComponent />);

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
      GetUser: {
        user: {
          staffAccountId: null,
        },
      },
    };

    const { findByText } = render(
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <TestRouter router={{ query: { accountListId: 'account-list-1' } }}>
            <GqlMockedProvider<{
              GetUser: GetUserQuery;
            }>
              mocks={mockNoStaffAccount}
            >
              <AdditionalSalaryRequestPage />
            </GqlMockedProvider>
          </TestRouter>
        </SnackbarProvider>
      </ThemeProvider>,
    );

    expect(
      await findByText(/access to this feature is limited/i),
    ).toBeInTheDocument();
  });

  it('should show limited access if user does not have access to page', async () => {
    const { findByText } = render(
      <TestComponent userType={UserTypeEnum.NonCru} />,
    );

    expect(
      await findByText('Access to this feature is limited.'),
    ).toBeInTheDocument();
  });
});
