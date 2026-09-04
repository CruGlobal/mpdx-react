import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';
import { constantsMock } from 'src/components/HrTools/GoalCalculator/GoalCalculatorTestWrapper';
import { NewStaffGoalCalculationQuery } from 'src/components/HrTools/NsGoalCalculator/GoalSettings/NewStaffGoalCalculation.generated';
import { NewStaffQuestionnaireMaritalStatusEnum } from 'src/graphql/types.generated';
import { GoalCalculatorConstantsQuery } from 'src/hooks/goalCalculatorConstants.generated';
import theme from 'src/theme';
import { NsStaffDetailsPage, getServerSideProps } from './index.page';

const push = jest.fn();

const TestComponent: React.FC = () => (
  <TestRouter
    router={{
      query: {
        accountListId: 'account-list-1',
        staffAccountListId: 'staff-account-list-1',
      },
      push,
    }}
  >
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <GqlMockedProvider<{
          GoalCalculatorConstants: GoalCalculatorConstantsQuery;
          NewStaffGoalCalculation: NewStaffGoalCalculationQuery;
        }>
          mocks={{
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
        >
          <NsStaffDetailsPage />
        </GqlMockedProvider>
      </SnackbarProvider>
    </ThemeProvider>
  </TestRouter>
);

describe('Staff Details page', () => {
  it('uses ensureSessionAndAccountList for server-side props', () => {
    expect(getServerSideProps).toBe(ensureSessionAndAccountList);
  });

  it("renders the household's goal settings", async () => {
    const { findByRole } = render(<TestComponent />);

    expect(
      await findByRole('heading', { name: 'John & Jane Doe' }),
    ).toBeInTheDocument();
  });

  it('goes back to the active goals tab of the admin table', async () => {
    const { findByRole } = render(<TestComponent />);

    userEvent.click(await findByRole('button', { name: 'Back to Table' }));

    await waitFor(() =>
      expect(push).toHaveBeenCalledWith(
        '/accountLists/account-list-1/hrTools/mpdGoalAdmin?tab=active-goals',
      ),
    );
  });
});
