import { GetServerSidePropsContext } from 'next';
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { constantsMock } from 'src/components/HrTools/GoalCalculator/GoalCalculatorTestWrapper';
import { NewStaffGoalCalculationQuery } from 'src/components/HrTools/NsGoalCalculator/GoalSettings/NewStaffGoalCalculation.generated';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import {
  NewStaffQuestionnaireMaritalStatusEnum,
  UsStaffGroupEnum,
  UserTypeEnum,
} from 'src/graphql/types.generated';
import { GoalCalculatorConstantsQuery } from 'src/hooks/goalCalculatorConstants.generated';
import theme from 'src/theme';
import { NsStaffDetailsPage, getServerSideProps } from './index.page';

jest.mock('pages/api/utils/pagePropsHelpers', () => ({
  blockImpersonatingNonDevelopers: jest.fn(),
}));

const mockBlockImpersonatingNonDevelopers =
  blockImpersonatingNonDevelopers as jest.MockedFunction<
    typeof blockImpersonatingNonDevelopers
  >;

const push = jest.fn();
const mutationSpy = jest.fn();

interface TestComponentProps {
  /** Senior Staff is the group the MPD goal tools are open to. */
  usStaffGroup?: UsStaffGroupEnum;
  /** Empty stands in for a router that has not resolved the path yet. */
  staffAccountListId?: string;
}

const TestComponent: React.FC<TestComponentProps> = ({
  usStaffGroup = UsStaffGroupEnum.SeniorStaff,
  staffAccountListId = 'staff-account-list-1',
}) => (
  <TestRouter
    router={{
      query: {
        accountListId: 'account-list-1',
        ...(staffAccountListId ? { staffAccountListId } : {}),
      },
      push,
    }}
  >
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <GqlMockedProvider<{
          GetUser: GetUserQuery;
          GoalCalculatorConstants: GoalCalculatorConstantsQuery;
          NewStaffGoalCalculation: NewStaffGoalCalculationQuery;
        }>
          mocks={{
            GetUser: {
              user: {
                userType: UserTypeEnum.UsStaff,
                usStaffGroup,
                staffAccountId: 'staff-account-1',
              },
            },
            GoalCalculatorConstants: { constant: constantsMock },
            NewStaffGoalCalculation: {
              newStaffGoalCalculation: {
                id: 'calc-1',
                firstName: 'John',
                lastName: 'Doe',
                spouseFirstName: 'Jane',
                maritalStatus: NewStaffQuestionnaireMaritalStatusEnum.Married,
                spouseJoining: false,
              },
            },
          }}
          onCall={mutationSpy}
        >
          <NsStaffDetailsPage />
        </GqlMockedProvider>
      </SnackbarProvider>
    </ThemeProvider>
  </TestRouter>
);

describe('Staff Details page', () => {
  beforeEach(() => {
    process.env.DEVELOPMENT_ENV = 'false';
  });

  it("renders the household's goal settings", async () => {
    const { findByRole } = render(<TestComponent />);

    expect(
      await findByRole('heading', { name: 'John & Jane Doe' }),
    ).toBeInTheDocument();
  });

  it('goes back to the active goals tab of the admin table', async () => {
    const { findByRole } = render(<TestComponent />);

    const backLink = await findByRole('link', { name: 'Back to Table' });
    expect(backLink).toHaveAttribute(
      'href',
      '/accountLists/account-list-1/hrTools/mpdGoalAdmin?tab=active-goals',
    );

    userEvent.click(backLink);

    await waitFor(() =>
      expect(push).toHaveBeenCalledWith(
        '/accountLists/account-list-1/hrTools/mpdGoalAdmin?tab=active-goals',
      ),
    );
  });

  // The page's whole purpose is the household's goal, and the mock answers with
  // the same fixture whatever it is asked for, so assert the variables.
  it("loads the household's goal, not the signed-in admin's", async () => {
    render(<TestComponent />);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('NewStaffGoalCalculation', {
        accountListId: 'staff-account-list-1',
        id: null,
      }),
    );
  });

  it('renders a loading state until the route supplies the household', () => {
    const { getByRole, queryByRole } = render(
      <TestComponent staffAccountListId="" />,
    );

    expect(getByRole('progressbar')).toBeInTheDocument();
    expect(queryByRole('navigation')).not.toBeInTheDocument();
  });

  it("denies a user outside the admin table's group", async () => {
    const { findByRole } = render(
      <TestComponent usStaffGroup={UsStaffGroupEnum.NewStaff} />,
    );

    expect(
      await findByRole('heading', {
        name: 'Access to this feature is limited.',
      }),
    ).toBeInTheDocument();
  });
});

describe('Staff Details getServerSideProps', () => {
  const context = {} as GetServerSidePropsContext;
  const originalFlag = process.env.DISABLE_MPD_GOAL_ADMIN;

  afterEach(() => {
    process.env.DISABLE_MPD_GOAL_ADMIN = originalFlag;
    jest.clearAllMocks();
  });

  it('returns notFound and does not delegate when the flag is set', async () => {
    process.env.DISABLE_MPD_GOAL_ADMIN = 'true';

    const result = await getServerSideProps(context);

    expect(result).toEqual({ notFound: true });
    expect(mockBlockImpersonatingNonDevelopers).not.toHaveBeenCalled();
  });

  it('delegates to blockImpersonatingNonDevelopers when the flag is unset', async () => {
    delete process.env.DISABLE_MPD_GOAL_ADMIN;
    const expected = { props: { session: {} } };
    mockBlockImpersonatingNonDevelopers.mockResolvedValue(
      expected as Awaited<ReturnType<typeof blockImpersonatingNonDevelopers>>,
    );

    const result = await getServerSideProps(context);

    expect(mockBlockImpersonatingNonDevelopers).toHaveBeenCalledWith(context);
    expect(result).toBe(expected);
  });
});
