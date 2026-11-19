import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import theme from 'src/theme';
import { MpdGoalAdminProvider } from '../MpdGoalAdminContext';
import {
  NewStaffCohortAttendeesQuery,
  NewStaffCohortsQuery,
} from '../NewStaffCohorts.generated';
import {
  attendeesMock,
  cohortsMock,
  coordinatorUserMock,
  goalsAdminUserMock,
} from '../mpdGoalAdminMocks';
import { QuestionnaireOpenSwitch } from './QuestionnaireOpenSwitch';
import { SetNewStaffCohortQuestionnaireOpenMutation } from './SetNewStaffCohortQuestionnaireOpen.generated';

const mutationSpy = jest.fn();

const mockEnqueue = jest.fn();
jest.mock('notistack', () => ({
  ...jest.requireActual('notistack'),
  useSnackbar: () => ({ enqueueSnackbar: mockEnqueue }),
}));

interface TestComponentProps {
  isGoalsAdmin?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  isGoalsAdmin = true,
}) => (
  <ThemeProvider theme={theme}>
    <SnackbarProvider>
      <GqlMockedProvider<{
        GetUser: GetUserQuery;
        NewStaffCohorts: NewStaffCohortsQuery;
        NewStaffCohortAttendees: NewStaffCohortAttendeesQuery;
        SetNewStaffCohortQuestionnaireOpen: SetNewStaffCohortQuestionnaireOpenMutation;
      }>
        mocks={{
          GetUser: isGoalsAdmin ? goalsAdminUserMock : coordinatorUserMock,
          NewStaffCohorts: cohortsMock,
          NewStaffCohortAttendees: attendeesMock(),
          // Normalizes over the selected cohort, so the switch flips without a refetch.
          SetNewStaffCohortQuestionnaireOpen: {
            setNewStaffCohortQuestionnaireOpen: {
              newStaffCohort: { id: 'fall-nso-2026', questionnaireOpen: true },
            },
          },
        }}
        onCall={mutationSpy}
      >
        <TestRouter>
          <MpdGoalAdminProvider>
            <QuestionnaireOpenSwitch />
          </MpdGoalAdminProvider>
        </TestRouter>
      </GqlMockedProvider>
    </SnackbarProvider>
  </ThemeProvider>
);

describe('QuestionnaireOpenSwitch', () => {
  it('opens the questionnaire for the selected training', async () => {
    const { findByRole, findByText } = render(<TestComponent />);

    const toggle = await findByRole('switch', {
      name: 'NSO MPD Questionnaire open',
    });
    expect(toggle).not.toBeChecked();
    expect(await findByText('Closed')).toBeInTheDocument();

    userEvent.click(toggle);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation(
        'SetNewStaffCohortQuestionnaireOpen',
        { input: { id: 'fall-nso-2026', open: true } },
      ),
    );
    await waitFor(() => expect(toggle).toBeChecked());
    expect(await findByText('Open')).toBeInTheDocument();
    expect(mockEnqueue).toHaveBeenCalledWith(
      'The NSO MPD Questionnaire is now open for Fall NSO 2026.',
      { variant: 'success' },
    );
  });

  it('shows coordinators the status without a switch', async () => {
    const { findByText, queryByRole } = render(
      <TestComponent isGoalsAdmin={false} />,
    );

    expect(await findByText('Closed')).toBeInTheDocument();
    expect(queryByRole('switch')).not.toBeInTheDocument();
  });
});
