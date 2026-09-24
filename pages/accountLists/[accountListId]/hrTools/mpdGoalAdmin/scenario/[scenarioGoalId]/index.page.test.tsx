import { GetServerSidePropsContext } from 'next';
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { getSession } from 'next-auth/react';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  expectedGuardOutcomes,
  impersonationGuardOutcomes,
} from '__tests__/util/impersonationGuard';
import { constantsMock } from 'src/components/HrTools/GoalCalculator/GoalCalculatorTestWrapper';
import { NewStaffGoalCalculationQuery } from 'src/components/HrTools/NsGoalCalculator/GoalSettings/NewStaffGoalCalculation.generated';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import {
  NewStaffQuestionnaireMaritalStatusEnum,
  UserTypeEnum,
} from 'src/graphql/types.generated';
import { GoalCalculatorConstantsQuery } from 'src/hooks/goalCalculatorConstants.generated';
import { ImpersonationArea } from 'src/lib/impersonationAccess';
import theme from 'src/theme';
import { NsScenarioGoalPage, getServerSideProps } from './index.page';

interface TestComponentProps {
  /** The MPD Goals team and MPD coordinators are the only ones let in. */
  canViewNewStaffCohorts?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  canViewNewStaffCohorts = true,
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
                canViewNewStaffCohorts,
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

  it('denies a user without goals-team or coordinator access', async () => {
    const { findByRole } = render(
      <TestComponent canViewNewStaffCohorts={false} />,
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
    expect(getSession).not.toHaveBeenCalled();
  });

  it('guards by impersonator role when the flag is unset', async () => {
    delete process.env.DISABLE_MPD_GOAL_ADMIN;

    expect(await impersonationGuardOutcomes(getServerSideProps)).toEqual(
      expectedGuardOutcomes(ImpersonationArea.MpdGoalAdmin),
    );
  });
});
