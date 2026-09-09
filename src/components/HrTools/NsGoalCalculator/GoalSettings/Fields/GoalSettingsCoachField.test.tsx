import React from 'react';
import { ThemeProvider } from '@mui/material';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { AssignCoachToNewStaffCohortAttendeeMutation } from 'src/components/HrTools/MpdGoalAdmin/AssignCoach.generated';
import {
  assignableCoachesMock,
  assignedCoachMock,
} from 'src/components/HrTools/MpdGoalAdmin/mpdGoalAdminMocks';
import theme from 'src/theme';
import {
  NewStaffCohortAttendeeAssignableCoachesQuery,
  UnassignCoachFromNewStaffCohortAttendeeMutation,
} from '../AttendeeCoach.generated';
import {
  NewStaffGoalCalculationQuery,
  useNewStaffGoalCalculationQuery,
} from '../NewStaffGoalCalculation.generated';
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
  mocks?: ApolloErgonoMockMap;
}

const TestComponent: React.FC<TestComponentProps> = ({
  household = attendee,
  mocks = {},
}) => (
  <ThemeProvider theme={theme}>
    <SnackbarProvider>
      <GqlMockedProvider<{
        NewStaffCohortAttendeeAssignableCoaches: NewStaffCohortAttendeeAssignableCoachesQuery;
      }>
        mocks={
          {
            NewStaffCohortAttendeeAssignableCoaches: {
              newStaffCohortAssignableCoaches:
                assignableCoachesMock.newStaffCohortAssignableCoaches,
            },
            ...mocks,
          } as ApolloErgonoMockMap
        }
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

/** Reads the attendee back out of the cache, as GoalSettingsHeader does, so a mutation payload that normalizes over it reaches the field. */
const CachedCoachField: React.FC = () => {
  const { data } = useNewStaffGoalCalculationQuery({
    variables: { accountListId: 'account-list-1', id: null },
  });
  const cachedAttendee = data?.newStaffGoalCalculation?.newStaffCohortAttendee;

  return cachedAttendee ? (
    <GoalSettingsCoachField
      attendee={cachedAttendee}
      subjectName="John & Jane Doe"
    />
  ) : null;
};

interface CachedTestComponentProps {
  household?: GoalSettingsAttendee;
}

const CachedTestComponent: React.FC<CachedTestComponentProps> = ({
  household = coachedAttendee,
}) => (
  <ThemeProvider theme={theme}>
    <SnackbarProvider>
      <GqlMockedProvider<{
        NewStaffGoalCalculation: NewStaffGoalCalculationQuery;
        NewStaffCohortAttendeeAssignableCoaches: NewStaffCohortAttendeeAssignableCoachesQuery;
        AssignCoachToNewStaffCohortAttendee: AssignCoachToNewStaffCohortAttendeeMutation;
        UnassignCoachFromNewStaffCohortAttendee: UnassignCoachFromNewStaffCohortAttendeeMutation;
      }>
        mocks={{
          NewStaffGoalCalculation: {
            newStaffGoalCalculation: {
              id: 'goal-calculation-1',
              newStaffCohortAttendee: household,
            },
          },
          NewStaffCohortAttendeeAssignableCoaches: {
            newStaffCohortAssignableCoaches:
              assignableCoachesMock.newStaffCohortAssignableCoaches,
          },
          AssignCoachToNewStaffCohortAttendee: assignedCoachMock(
            [attendee.id],
            'coach-1',
          ),
          UnassignCoachFromNewStaffCohortAttendee: {
            unassignCoachFromNewStaffCohortAttendee: {
              newStaffCohortAttendees: [{ id: attendee.id, coach: null }],
            },
          },
        }}
        onCall={mutationSpy}
      >
        <CachedCoachField />
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

  it('reports a failed removal instead of closing on a silent failure', async () => {
    const { getByRole, findByRole } = render(
      <TestComponent
        household={coachedAttendee}
        mocks={{
          UnassignCoachFromNewStaffCohortAttendee: {
            unassignCoachFromNewStaffCohortAttendee: () => {
              throw new Error('Not authorized');
            },
          },
        }}
      />,
    );

    await userEvent.click(getByRole('button', { name: 'Remove' }));
    await userEvent.click(getByRole('button', { name: 'Yes' }));

    expect(await findByRole('alert')).toHaveTextContent(
      'The coach could not be removed. Please try again.',
    );
    expect(getByRole('textbox', { name: 'Coach' })).toHaveValue('Amy Wilson');
  });

  // Neither mutation refetches, so the payload normalizing over the cached attendee is the only thing that updates the field.
  describe('with the attendee read from the cache', () => {
    it('clears the coach after removal', async () => {
      const { findByRole, getByRole, queryByRole } = render(
        <CachedTestComponent />,
      );

      expect(await findByRole('textbox', { name: 'Coach' })).toHaveValue(
        'Amy Wilson',
      );

      await userEvent.click(getByRole('button', { name: 'Remove' }));
      await userEvent.click(getByRole('button', { name: 'Yes' }));

      await waitFor(() =>
        expect(getByRole('textbox', { name: 'Coach' })).toHaveValue(''),
      );
      expect(getByRole('button', { name: 'Assign Coach' })).toBeInTheDocument();
      expect(queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument();
    });

    it('shows the new coach after assignment', async () => {
      const { findByRole, getByRole } = render(
        <CachedTestComponent household={attendee} />,
      );

      await userEvent.click(
        await findByRole('button', { name: 'Assign Coach' }),
      );
      await userEvent.click(await findByRole('combobox', { name: 'Coach' }));
      await userEvent.click(await findByRole('option', { name: 'Amy Wilson' }));
      await userEvent.click(getByRole('button', { name: 'Save' }));

      await waitFor(() =>
        expect(getByRole('textbox', { name: 'Coach' })).toHaveValue(
          'Amy Wilson',
        ),
      );
    });
  });
});
