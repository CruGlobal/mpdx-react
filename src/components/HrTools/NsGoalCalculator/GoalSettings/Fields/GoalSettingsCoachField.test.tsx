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

const operation = (name: string) =>
  mutationSpy.mock.calls.find(
    ([call]) => call.operation.operationName === name,
  )?.[0].operation;

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
  assignedCoachId?: string;
}

const CachedTestComponent: React.FC<CachedTestComponentProps> = ({
  household = coachedAttendee,
  assignedCoachId = 'coach-1',
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
            assignedCoachId,
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

  it('shows an empty picker when the household has no coach', () => {
    const { getByRole, queryByRole } = render(<TestComponent />);

    expect(getByRole('combobox', { name: 'Coach' })).toHaveValue('');
    // Nothing to clear, so the picker offers no clear button either.
    expect(queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();
  });

  it('shows the assigned coach with a clear button', () => {
    const { getByRole } = render(<TestComponent household={coachedAttendee} />);

    expect(getByRole('combobox', { name: 'Coach' })).toHaveValue('Amy Wilson');
    expect(getByRole('button', { name: 'Clear' })).toBeInTheDocument();
  });

  // The list costs a OneApp lookup, so it must not load until the picker opens.
  it('loads the coach list only when the picker opens', async () => {
    const { getByRole } = render(<TestComponent />);

    expect(mutationSpy).not.toHaveBeenCalled();

    userEvent.click(getByRole('button', { name: 'Open' }));

    await waitFor(() =>
      expect(
        operation('NewStaffCohortAttendeeAssignableCoaches'),
      ).toBeDefined(),
    );
    expect(
      operation('NewStaffCohortAttendeeAssignableCoaches').variables,
    ).toEqual({ attendeeId: 'attendee-1' });
  });

  it('assigns the first coach without a confirmation', async () => {
    const { getByRole, findByRole, queryByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Open' }));
    userEvent.click(await findByRole('option', { name: 'Amy Wilson' }));

    await waitFor(() =>
      expect(
        operation('AssignCoachToNewStaffCohortAttendee').variables.input,
      ).toEqual({
        cohortId: 'cohort-1',
        attendeeIds: ['attendee-1'],
        coachId: 'coach-1',
      }),
    );
    expect(queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('confirms the switch before reassigning to another coach', async () => {
    const { getByRole, getByText, findByRole } = render(
      <TestComponent household={coachedAttendee} />,
    );

    userEvent.click(getByRole('button', { name: 'Open' }));
    userEvent.click(await findByRole('option', { name: 'Nelson Jones' }));

    expect(
      getByText(
        'Are you sure you want to make Nelson Jones the coach for John & Jane Doe? Amy Wilson will lose access to this account.',
      ),
    ).toBeInTheDocument();
    expect(operation('AssignCoachToNewStaffCohortAttendee')).toBeUndefined();

    userEvent.click(getByRole('button', { name: 'Yes' }));

    await waitFor(() =>
      expect(
        operation('AssignCoachToNewStaffCohortAttendee').variables.input,
      ).toEqual({
        cohortId: 'cohort-1',
        attendeeIds: ['attendee-1'],
        coachId: 'coach-3',
      }),
    );
  });

  it('keeps the current coach when the switch is declined', async () => {
    const { getByRole, findByRole } = render(
      <TestComponent household={coachedAttendee} />,
    );

    userEvent.click(getByRole('button', { name: 'Open' }));
    userEvent.click(await findByRole('option', { name: 'Nelson Jones' }));
    userEvent.click(getByRole('button', { name: 'No' }));

    // The picker is driven by the assignment, so declining puts the name back.
    await waitFor(() =>
      expect(getByRole('combobox', { name: 'Coach' })).toHaveValue(
        'Amy Wilson',
      ),
    );
    expect(operation('AssignCoachToNewStaffCohortAttendee')).toBeUndefined();
  });

  it('warns that clearing the coach revokes their access, then unassigns', async () => {
    const { getByRole, getByText } = render(
      <TestComponent household={coachedAttendee} />,
    );

    userEvent.click(getByRole('button', { name: 'Clear' }));

    expect(
      getByText(
        'Are you sure you want to remove Amy Wilson as the coach for John & Jane Doe? They will lose access to this account.',
      ),
    ).toBeInTheDocument();

    userEvent.click(getByRole('button', { name: 'Yes' }));

    await waitFor(() =>
      expect(
        operation('UnassignCoachFromNewStaffCohortAttendee').variables.input,
      ).toEqual({ cohortId: 'cohort-1', attendeeIds: ['attendee-1'] }),
    );
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

    userEvent.click(getByRole('button', { name: 'Clear' }));
    userEvent.click(getByRole('button', { name: 'Yes' }));

    expect(await findByRole('alert')).toHaveTextContent(
      'The coach could not be removed. Please try again.',
    );
    expect(getByRole('combobox', { name: 'Coach' })).toHaveValue('Amy Wilson');
  });

  it('reports a failed assignment', async () => {
    const { getByRole, findByRole } = render(
      <TestComponent
        mocks={{
          AssignCoachToNewStaffCohortAttendee: {
            assignCoachToNewStaffCohortAttendee: () => {
              throw new Error('Not authorized');
            },
          },
        }}
      />,
    );

    userEvent.click(getByRole('button', { name: 'Open' }));
    userEvent.click(await findByRole('option', { name: 'Amy Wilson' }));

    expect(await findByRole('alert')).toHaveTextContent(
      'The coach could not be assigned. Please try again.',
    );
  });

  // Neither mutation refetches, so the payload normalizing over the cached attendee is the only thing that updates the picker.
  describe('with the attendee read from the cache', () => {
    it('clears the coach after removal', async () => {
      const { findByRole, getByRole, queryByRole } = render(
        <CachedTestComponent />,
      );

      expect(await findByRole('combobox', { name: 'Coach' })).toHaveValue(
        'Amy Wilson',
      );

      userEvent.click(getByRole('button', { name: 'Clear' }));
      userEvent.click(getByRole('button', { name: 'Yes' }));

      await waitFor(() =>
        expect(getByRole('combobox', { name: 'Coach' })).toHaveValue(''),
      );
      expect(queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();
    });

    it('shows the new coach after a confirmed switch', async () => {
      const { findByRole, getByRole } = render(
        <CachedTestComponent assignedCoachId="coach-3" />,
      );

      expect(await findByRole('combobox', { name: 'Coach' })).toHaveValue(
        'Amy Wilson',
      );

      userEvent.click(getByRole('button', { name: 'Open' }));
      userEvent.click(await findByRole('option', { name: 'Nelson Jones' }));
      userEvent.click(getByRole('button', { name: 'Yes' }));

      await waitFor(() =>
        expect(getByRole('combobox', { name: 'Coach' })).toHaveValue(
          'Nelson Jones',
        ),
      );
    });
  });
});
