import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';
import { constantsMock } from 'src/components/HrTools/GoalCalculator/GoalCalculatorTestWrapper';
import { NewStaffGoalCalculationQuery } from 'src/components/HrTools/NsGoalCalculator/GoalSettings/NewStaffGoalCalculation.generated';
import { NewStaffQuestionnaireMaritalStatusEnum } from 'src/graphql/types.generated';
import { GoalCalculatorConstantsQuery } from 'src/hooks/goalCalculatorConstants.generated';
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
              calculatedResults: null,
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
  it('uses ensureSessionAndAccountList for server-side props', () => {
    expect(getServerSideProps).toBe(ensureSessionAndAccountList);
  });

  it('renders the goal settings form for the coachee', async () => {
    const { findByRole } = render(<TestComponent />);

    expect(
      await findByRole('heading', { name: 'Personal Information' }),
    ).toBeInTheDocument();
  });
});
