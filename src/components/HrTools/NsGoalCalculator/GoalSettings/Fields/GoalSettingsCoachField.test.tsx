import React from 'react';
import { ThemeProvider } from '@mui/material';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { assignableCoachesMock } from 'src/components/HrTools/MpdGoalAdmin/mpdGoalAdminMocks';
import theme from 'src/theme';
import { NewStaffCohortAttendeeAssignableCoachesQuery } from '../AttendeeCoach.generated';
import { GoalSettingsAttendee } from '../goalSettingsSectionProps';
import { GoalSettingsCoachField } from './GoalSettingsCoachField';

const mutationSpy = jest.fn();

const attendee: GoalSettingsAttendee = {
  id: 'attendee-1',
  newStaffCohortId: 'cohort-1',
  cohortName: 'Fall NSO 2026',
  coordinators: [],
  ministry: { id: 'ministry-1', name: 'Campus' },
  coach: null,
};

const coachedAttendee: GoalSettingsAttendee = {
  ...attendee,
  coach: {
    id: 'coach-1',
    firstName: 'Amy',
    lastName: 'Wilson',
    email: 'amy@cru.org',
  },
};

interface TestComponentProps {
  household?: GoalSettingsAttendee;
}

const TestComponent: React.FC<TestComponentProps> = ({
  household = attendee,
}) => (
  <ThemeProvider theme={theme}>
    <SnackbarProvider>
      <GqlMockedProvider<{
        NewStaffCohortAttendeeAssignableCoaches: NewStaffCohortAttendeeAssignableCoachesQuery;
      }>
        mocks={{
          NewStaffCohortAttendeeAssignableCoaches: {
            newStaffCohortAssignableCoaches:
              assignableCoachesMock.newStaffCohortAssignableCoaches,
          },
        }}
        onCall={mutationSpy}
      >
        <GoalSettingsCoachField
          attendee={household}
          subjectName="John & Jane Doe"
        />
      </GqlMockedProvider>
    </SnackbarProvider>
  </ThemeProvider>
);

describe('GoalSettingsCoachField', () => {
  beforeEach(() => {
    mutationSpy.mockClear();
  });

  it('offers to assign a coach and shows no name when the household has none', () => {
    const { getByRole, queryByRole } = render(<TestComponent />);

    expect(getByRole('textbox', { name: 'Coach' })).toHaveValue('');
    expect(getByRole('button', { name: 'Assign Coach' })).toBeInTheDocument();
    expect(queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument();
  });

  it('shows the assigned coach with change and remove actions', () => {
    const { getByRole } = render(<TestComponent household={coachedAttendee} />);

    expect(getByRole('textbox', { name: 'Coach' })).toHaveValue('Amy Wilson');
    expect(getByRole('button', { name: 'Change' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Remove' })).toBeInTheDocument();
  });

  // The list costs a OneApp lookup, so it must not load until the picker is opened.
  it('loads the coach list only when the picker opens', async () => {
    const { getByRole } = render(<TestComponent />);

    expect(mutationSpy).not.toHaveBeenCalled();

    await userEvent.click(getByRole('button', { name: 'Assign Coach' }));

    await waitFor(() =>
      expect(mutationSpy.mock.calls[0][0].operation.operationName).toBe(
        'NewStaffCohortAttendeeAssignableCoaches',
      ),
    );
    expect(mutationSpy.mock.calls[0][0].operation.variables).toEqual({
      attendeeId: 'attendee-1',
    });
  });

  it('assigns the chosen coach to this household alone', async () => {
    const { getByRole } = render(<TestComponent />);

    await userEvent.click(getByRole('button', { name: 'Assign Coach' }));
    const picker = await waitFor(() =>
      getByRole('combobox', { name: 'Coach' }),
    );
    await userEvent.click(picker);
    await userEvent.click(
      await waitFor(() => getByRole('option', { name: 'Amy Wilson' })),
    );
    await userEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      const assign = mutationSpy.mock.calls.find(
        ([call]) =>
          call.operation.operationName ===
          'AssignCoachToNewStaffCohortAttendee',
      );
      expect(assign?.[0].operation.variables.input).toEqual({
        cohortId: 'cohort-1',
        attendeeIds: ['attendee-1'],
        coachId: 'coach-1',
      });
    });
  });

  it('warns that removing the coach revokes their access, then unassigns', async () => {
    const { getByRole, getByText } = render(
      <TestComponent household={coachedAttendee} />,
    );

    await userEvent.click(getByRole('button', { name: 'Remove' }));

    expect(
      getByText(
        'Are you sure you want to remove Amy Wilson as the coach for John & Jane Doe? They will lose access to this account.',
      ),
    ).toBeInTheDocument();

    await userEvent.click(getByRole('button', { name: 'Yes' }));

    await waitFor(() => {
      const unassign = mutationSpy.mock.calls.find(
        ([call]) =>
          call.operation.operationName ===
          'UnassignCoachFromNewStaffCohortAttendee',
      );
      expect(unassign?.[0].operation.variables.input).toEqual({
        cohortId: 'cohort-1',
        attendeeIds: ['attendee-1'],
      });
    });
  });
});
