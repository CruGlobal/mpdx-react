import { ApolloCache } from '@apollo/client';
import { ThemeProvider } from '@mui/material/styles';
import { waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { DeepPartial } from 'ts-essentials';
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
import { createCache } from 'src/lib/apollo/cache';
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
  isSpouse?: boolean;
  cache?: ApolloCache<object>;
  latestRequest?: DeepPartial<
    AdditionalSalaryRequestQuery['latestAdditionalSalaryRequest']
  >;
}

const TestComponent: React.FC<TestComponentProps> = ({
  userType = UserTypeEnum.UsStaff,
  usStaffGroup = UsStaffGroupEnum.SeniorStaff,
  staffAccountId = 'account-list-1',
  hcmUnavailableCalls = 0,
  requestUnavailableCalls = 0,
  requestError = false,
  isSpouse = false,
  cache,
  latestRequest = { status: AsrStatusEnum.ApprovedAndPaid },
}) => (
  <ThemeProvider theme={theme}>
    <SnackbarProvider>
      <TestRouter
        router={{
          query: {
            accountListId: 'account-list-1',
            ...(isSpouse && { isSpouse: 'true' }),
          },
        }}
      >
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
              latestAdditionalSalaryRequest: latestRequest,
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
          cache={cache}
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

  it('starts over at the first step when switching to the spouse', async () => {
    // Share one cache so the rerender acts like a shallow route change
    const cache = createCache();
    const { findByRole, queryByRole, rerender } = render(
      <TestComponent cache={cache} />,
    );

    userEvent.click(await findByRole('button', { name: /continue/i }));
    expect(await findByRole('button', { name: /back/i })).toBeInTheDocument();

    rerender(<TestComponent cache={cache} isSpouse />);

    expect(
      await findByRole('button', { name: /continue/i }),
    ).toBeInTheDocument();
    expect(queryByRole('button', { name: /back/i })).not.toBeInTheDocument();
    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('AdditionalSalaryRequest', {
        isSpouse: true,
      }),
    );
  });

  it('keeps the submit confirmation closed for a $0 request', async () => {
    const zeroRequest = {
      id: 'asr-1',
      status: AsrStatusEnum.InProgress,
      phoneNumber: '4075551234',
      emailAddress: 'staff@cru.org',
      currentYearSalaryNotReceived: 0,
      previousYearSalaryNotReceived: 0,
      additionalSalaryWithinMax: 0,
      adoption: 0,
      counselingNonMedical: 0,
      healthcareExpensesExceedingLimit: 0,
      babysittingMinistryEvents: 0,
      childrenMinistryTripExpenses: 0,
      childrenCollegeEducation: 0,
      movingExpense: 0,
      seminary: 0,
      housingDownPayment: 0,
      autoPurchase: 0,
      expensesNotApprovedWithin90Days: 0,
      totalAdditionalSalaryRequested: 0,
    };
    const { findByRole, findByText, queryByText } = render(
      <TestComponent latestRequest={zeroRequest} />,
    );

    userEvent.click(await findByRole('button', { name: /continue/i }));
    userEvent.click(await findByRole('button', { name: /submit/i }));

    expect(
      await findByText(
        'Enter an amount in at least one category before submitting.',
        { selector: 'li' },
      ),
    ).toBeInTheDocument();
    expect(
      queryByText('Are you ready to submit your Additional Salary Request?'),
    ).not.toBeInTheDocument();
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
