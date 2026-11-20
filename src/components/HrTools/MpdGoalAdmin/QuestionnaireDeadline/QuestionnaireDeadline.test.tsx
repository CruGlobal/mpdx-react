import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import matchMediaMock from '__tests__/util/matchMediaMock';
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
import { QuestionnaireDeadline } from './QuestionnaireDeadline';
import { SetNewStaffCohortQuestionnaireDeadlineMutation } from './SetNewStaffCohortQuestionnaireDeadline.generated';

const mutationSpy = jest.fn();

const mockEnqueue = jest.fn();
jest.mock('notistack', () => ({
  ...jest.requireActual('notistack'),
  useSnackbar: () => ({ enqueueSnackbar: mockEnqueue }),
}));

const deadline = '2027-01-20T22:00:00Z';

const withDeadline = (value: string | null): NewStaffCohortsQuery => ({
  newStaffCohorts: {
    ...cohortsMock.newStaffCohorts,
    nodes: cohortsMock.newStaffCohorts.nodes.map((node, index) =>
      index === 0 ? { ...node, questionnaireDeadline: value } : node,
    ),
  },
});

interface TestComponentProps {
  isGoalsAdmin?: boolean;
  startDeadline?: string | null;
  failSave?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  isGoalsAdmin = true,
  startDeadline = null,
  failSave = false,
}) => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale="en-US">
      <SnackbarProvider>
        <GqlMockedProvider<{
          GetUser: GetUserQuery;
          NewStaffCohorts: NewStaffCohortsQuery;
          NewStaffCohortAttendees: NewStaffCohortAttendeesQuery;
          SetNewStaffCohortQuestionnaireDeadline: SetNewStaffCohortQuestionnaireDeadlineMutation;
        }>
          mocks={{
            GetUser: isGoalsAdmin ? goalsAdminUserMock : coordinatorUserMock,
            NewStaffCohorts: withDeadline(startDeadline),
            NewStaffCohortAttendees: attendeesMock(),
            SetNewStaffCohortQuestionnaireDeadline: {
              setNewStaffCohortQuestionnaireDeadline: failSave
                ? ((() => {
                    throw new Error('Save failed');
                  }) as never)
                : {
                    newStaffCohort: {
                      id: 'fall-nso-2026',
                      questionnaireDeadline: startDeadline ? null : deadline,
                    },
                  },
            },
          }}
          onCall={mutationSpy}
        >
          <TestRouter>
            <MpdGoalAdminProvider>
              <QuestionnaireDeadline />
            </MpdGoalAdminProvider>
          </TestRouter>
        </GqlMockedProvider>
      </SnackbarProvider>
    </LocalizationProvider>
  </ThemeProvider>
);

describe('QuestionnaireDeadline', () => {
  beforeEach(() => {
    // Desktop date/time fields, which accept typing
    matchMediaMock({ pointer: 'fine' });
  });

  it('shows coordinators the deadline in Eastern time, with no way to edit it', async () => {
    const { findByText, queryByRole } = render(
      <TestComponent isGoalsAdmin={false} startDeadline={deadline} />,
    );

    expect(await findByText('Jan 20, 2027, 5:00 PM EST')).toBeInTheDocument();
    expect(
      queryByRole('button', { name: 'Edit questionnaire deadline' }),
    ).not.toBeInTheDocument();
  });

  it('sets a deadline entered in Eastern time', async () => {
    const { findByRole, getByRole, findByText } = render(<TestComponent />);

    expect(await findByText('None')).toBeInTheDocument();
    userEvent.click(
      await findByRole('button', { name: 'Edit questionnaire deadline' }),
    );
    userEvent.type(getByRole('textbox', { name: 'Date' }), '1/20/2027');
    userEvent.type(
      getByRole('textbox', { name: 'Time (Eastern)' }),
      '05:00 PM',
    );
    userEvent.tab();
    userEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation(
        'SetNewStaffCohortQuestionnaireDeadline',
        {
          input: { id: 'fall-nso-2026', deadline: '2027-01-20T22:00:00.000Z' },
        },
      ),
    );
    expect(await findByText('Jan 20, 2027, 5:00 PM EST')).toBeInTheDocument();
    expect(mockEnqueue).toHaveBeenCalledWith(
      'Questionnaire deadline saved for Fall NSO 2026.',
      { variant: 'success' },
    );
  });

  it('needs both a date and a time before it saves', async () => {
    const { findByRole, getByRole } = render(<TestComponent />);

    userEvent.click(
      await findByRole('button', { name: 'Edit questionnaire deadline' }),
    );
    userEvent.type(getByRole('textbox', { name: 'Date' }), '1/20/2027');
    userEvent.tab();

    expect(getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('refreshes the rows, whose lock comes from the deadline', async () => {
    const { findByRole, getByRole } = render(
      <TestComponent startDeadline={deadline} />,
    );

    userEvent.click(
      await findByRole('button', { name: 'Edit questionnaire deadline' }),
    );
    mutationSpy.mockClear();
    userEvent.click(getByRole('button', { name: 'Remove Deadline' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('NewStaffCohortAttendees'),
    );
  });

  it('removes the deadline', async () => {
    const { findByRole, getByRole } = render(
      <TestComponent startDeadline={deadline} />,
    );

    userEvent.click(
      await findByRole('button', { name: 'Edit questionnaire deadline' }),
    );
    userEvent.click(getByRole('button', { name: 'Remove Deadline' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation(
        'SetNewStaffCohortQuestionnaireDeadline',
        { input: { id: 'fall-nso-2026', deadline: null } },
      ),
    );
    expect(mockEnqueue).toHaveBeenCalledWith(
      'Questionnaire deadline removed for Fall NSO 2026.',
      { variant: 'success' },
    );
  });

  it('keeps the dialog open when the save fails', async () => {
    const { findByRole, getByRole } = render(
      <TestComponent startDeadline={deadline} failSave />,
    );

    userEvent.click(
      await findByRole('button', { name: 'Edit questionnaire deadline' }),
    );
    userEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation(
        'SetNewStaffCohortQuestionnaireDeadline',
      ),
    );
    expect(getByRole('dialog')).toBeInTheDocument();
    expect(mockEnqueue).not.toHaveBeenCalled();
  });
});
