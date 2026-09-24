import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  expectedGuardOutcomes,
  impersonationGuardOutcomes,
} from '__tests__/util/impersonationGuard';
import { constantsMock } from 'src/components/HrTools/GoalCalculator/GoalCalculatorTestWrapper';
import { NewStaffGoalCalculationQuery } from 'src/components/HrTools/NsGoalCalculator/GoalSettings/NewStaffGoalCalculation.generated';
import { NewStaffQuestionnaireMaritalStatusEnum } from 'src/graphql/types.generated';
import { GoalCalculatorConstantsQuery } from 'src/hooks/goalCalculatorConstants.generated';
import { ImpersonationArea } from 'src/lib/impersonationAccess';
import theme from 'src/theme';
import { NsGoalCalculatorPage, getServerSideProps } from './index.page';

const coachingId = 'coaching-account-1';

const TestComponent: React.FC = () => (
  <TestRouter
    router={{
      query: { accountListId: 'account-list-1', coachingId },
    }}
  >
    <ThemeProvider theme={theme}>
      <GqlMockedProvider<{
        GoalCalculatorConstants: GoalCalculatorConstantsQuery;
        NewStaffGoalCalculation: NewStaffGoalCalculationQuery;
      }>
        mocks={{
          GoalCalculatorConstants: { constant: constantsMock },
          NewStaffGoalCalculation: {
            newStaffGoalCalculation: {
              id: 'goal-calculation-1',
              firstName: 'John',
              lastName: 'Doe',
              spouseFirstName: 'Jane',
              maritalStatus: NewStaffQuestionnaireMaritalStatusEnum.Married,
              spouseJoining: false,
            },
          },
        }}
      >
        <NsGoalCalculatorPage />
      </GqlMockedProvider>
    </ThemeProvider>
  </TestRouter>
);

describe('Coaching NsGoalCalculator page', () => {
  it('guards server-side props by impersonator role like the HR tool', async () => {
    expect(await impersonationGuardOutcomes(getServerSideProps)).toEqual(
      expectedGuardOutcomes(ImpersonationArea.NsGoalCalculator),
    );
  });

  it('renders the goal settings form for the coachee', async () => {
    const { findByRole } = render(<TestComponent />);

    expect(
      await findByRole('heading', { name: 'Personal Information' }),
    ).toBeInTheDocument();
  });
});
