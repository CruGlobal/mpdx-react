import { GetServerSidePropsContext } from 'next';
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
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
import { NsScenarioGoalPage, getServerSideProps } from './index.page';

jest.mock('pages/api/utils/pagePropsHelpers', () => ({
  blockImpersonatingNonDevelopers: jest.fn(),
}));

const mockBlockImpersonatingNonDevelopers =
  blockImpersonatingNonDevelopers as jest.MockedFunction<
    typeof blockImpersonatingNonDevelopers
  >;

interface TestComponentProps {
  /** Senior Staff is the group the MPD goal tools are open to. */
  usStaffGroup?: UsStaffGroupEnum;
}

const TestComponent: React.FC<TestComponentProps> = ({
  usStaffGroup = UsStaffGroupEnum.SeniorStaff,
}) => (
  <TestRouter
    router={{
      query: {
        accountListId: 'account-list-1',
        scenarioGoalId: 'scenario-1',
      },
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
                id: 'scenario-1',
                firstName: 'John',
                lastName: 'Doe',
                spouseFirstName: 'Jane',
                maritalStatus: NewStaffQuestionnaireMaritalStatusEnum.Married,
                spouseJoining: false,
              },
            },
          }}
        >
          <NsScenarioGoalPage />
        </GqlMockedProvider>
      </SnackbarProvider>
    </ThemeProvider>
  </TestRouter>
);

describe('Scenario NsGoalCalculator page', () => {
  beforeEach(() => {
    process.env.DEVELOPMENT_ENV = 'false';
  });

  it('renders the goal settings form in scenario mode', async () => {
    const { findByRole } = render(<TestComponent />);

    expect(
      await findByRole('heading', { name: 'Contact Info' }),
    ).toBeInTheDocument();
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

describe('Scenario NsGoalCalculator getServerSideProps', () => {
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
