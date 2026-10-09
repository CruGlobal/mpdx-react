import { ThemeProvider } from '@mui/material/styles';
import { waitFor, within } from '@testing-library/react';
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
import { AdditionalSalaryRequestQuery } from 'src/components/HrTools/AdditionalSalaryRequest/AdditionalSalaryRequest.generated';
import { HcmQuery } from 'src/components/HrTools/Shared/HcmData/Hcm.generated';
import { mockHcmUnavailable } from 'src/components/HrTools/Shared/HcmData/mockHcmUnavailable';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import {
  AsrStatusEnum,
  UsStaffGroupEnum,
  UserTypeEnum,
} from 'src/graphql/types.generated';
import theme from 'src/theme';
import AdditionalSalaryRequestPage, { getServerSideProps } from './index.page';

const mutationSpy = jest.fn();

const heavyLoadMessage =
  'The system is currently under heavy load. Please try again in a few minutes.';

interface TestComponentProps {
  userType?: UserTypeEnum;
  usStaffGroup?: UsStaffGroupEnum.SeniorStaff;
  staffAccountId?: string;
  hcmUnavailableCalls?: number;
  requestUnavailableCalls?: number;
  requestError?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  userType = UserTypeEnum.UsStaff,
  usStaffGroup = UsStaffGroupEnum.SeniorStaff,
  staffAccountId = 'account-list-1',
  hcmUnavailableCalls = 0,
  requestUnavailableCalls = 0,
  requestError = false,
}) => (
  <ThemeProvider theme={theme}>
    <SnackbarProvider>
      <TestRouter router={{ query: { accountListId: 'account-list-1' } }}>
        <GqlMockedProvider<{
          GetUser: GetUserQuery;
          Hcm: HcmQuery;
          AdditionalSalaryRequest: AdditionalSalaryRequestQuery;
        }>
          mocks={{
            GetUser: {
              user: { userType, usStaffGroup, staffAccountId },
            },
            Hcm: {
              hcm: mockHcmUnavailable(
                [
                  {
                    asrEit: {
                      asrEligibility: true,
                    },
                  },
                ],
                hcmUnavailableCalls,
              ),
            },
            AdditionalSalaryRequest: {
              latestAdditionalSalaryRequest: {
                status: AsrStatusEnum.ApprovedAndPaid,
              },
            },
            ...(requestError && {
              AdditionalSalaryRequest: {
                latestAdditionalSalaryRequest: (() => {
                  throw new Error('SAA is unavailable');
                }) as never,
              },
            }),
            ...(requestUnavailableCalls > 0 && {
              AdditionalSalaryRequest: {
                latestAdditionalSalaryRequest: mockHcmUnavailable(
                  null as never,
                  requestUnavailableCalls,
                ) as never,
              },
            }),
          }}
          onCall={mutationSpy}
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

  describe.each([
    ['HCM query', 'hcmUnavailableCalls'],
    ['request query', 'requestUnavailableCalls'],
  ] as const)('when the %s is unavailable', (_, failingQuery) => {
    it('shows the heavy load alert instead of the page', async () => {
      const { findByRole, queryByRole } = render(
        <TestComponent {...{ [failingQuery]: Infinity }} />,
      );

      expect(await findByRole('alert')).toHaveTextContent(heavyLoadMessage);
      expect(
        queryByRole('heading', { name: 'About this Form' }),
      ).not.toBeInTheDocument();
    });

    it('loads the page when Try Again succeeds', async () => {
      const { findByRole, queryByText } = render(
        <TestComponent {...{ [failingQuery]: 1 }} />,
      );

      const alert = await findByRole('alert');
      userEvent.click(within(alert).getByRole('button', { name: 'Try Again' }));

      expect(
        await findByRole('heading', { name: 'About this Form' }),
      ).toBeInTheDocument();
      expect(queryByText(heavyLoadMessage)).not.toBeInTheDocument();
    });
  });

  it('shows the load error when the request fails for another reason', async () => {
    const { findByRole, queryByText } = render(<TestComponent requestError />);

    const alert = await findByRole('alert');
    expect(alert).toHaveTextContent(
      'Your Additional Salary Request could not be loaded. Please try again later.',
    );
    expect(queryByText(heavyLoadMessage)).not.toBeInTheDocument();

    userEvent.click(within(alert).getByRole('button', { name: 'Try Again' }));
    await waitFor(() =>
      expect(
        mutationSpy.mock.calls
          .map(([{ operation }]) => operation)
          .filter(
            (operation) =>
              operation.operationName === 'AdditionalSalaryRequest',
          ),
      ).toHaveLength(2),
    );
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
